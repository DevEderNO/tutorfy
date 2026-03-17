import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import {
  Badge,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty,
  TableToolbar, TableSearch, TableFilter,
  Pagination,
  sortRows, nextSortDirection,
  type SortState, type SortDirection,
} from '@tutorfy/ui';

interface UserRow {
  id: string; name: string; email: string; isActive: boolean; createdAt: string;
  _count: { students: number };
  subscription: { status: string; plan: { name: string; slug: string } } | null;
}
interface ListResult {
  data: UserRow[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

type SortKey = 'name' | 'email' | 'students' | 'status';

const ACTIVE_OPTIONS = [
  { value: 'true', label: 'Ativo' },
  { value: 'false', label: 'Inativo' },
];

export function UsersListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string[]>([]);
  const [sortState, setSortState] = useState<SortState<SortKey>>({ column: null, direction: null });

  const isActiveParam = activeFilter.length === 1 ? activeFilter[0] : '';

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { search, page, isActiveParam }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (isActiveParam) params.set('isActive', isActiveParam);
      const res = await api.get<ListResult>(`/admin/users?${params}`);
      return res.data;
    },
  });

  function handleSort(col: SortKey) {
    setSortState((prev) => ({
      column: col,
      direction: prev.column === col ? nextSortDirection(prev.direction) : 'asc',
    }));
  }

  function sortDir(col: SortKey): SortDirection {
    return sortState.column === col ? sortState.direction : null;
  }

  const rows = sortRows(data?.data ?? [], sortState, (row, col) => {
    if (col === 'name') return row.name;
    if (col === 'email') return row.email;
    if (col === 'students') return row._count.students;
    if (col === 'status') return row.isActive ? 1 : 0;
    return '';
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
        <p className="text-sm text-muted-foreground mt-1">Tutores cadastrados na plataforma</p>
      </div>

      <TableToolbar>
        <TableSearch
          placeholder="Buscar por nome ou email…"
          value={search}
          onValueChange={(v) => { setSearch(v); setPage(1); }}
        />
        <TableFilter
          label="Status"
          options={ACTIVE_OPTIONS}
          value={activeFilter}
          onValueChange={(v) => { setActiveFilter(v); setPage(1); }}
          multiple
        />
      </TableToolbar>

      <div className="glass rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead sortable sortDirection={sortDir('name')} onSort={() => handleSort('name')}>Nome</TableHead>
              <TableHead sortable sortDirection={sortDir('email')} onSort={() => handleSort('email')}>Email</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead sortable sortDirection={sortDir('students')} onSort={() => handleSort('students')}>Alunos</TableHead>
              <TableHead sortable sortDirection={sortDir('status')} onSort={() => handleSort('status')}>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>{[...Array(6)].map((_, j) => <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>
              ))
            ) : !rows.length ? (
              <TableEmpty colSpan={6} message="Nenhum usuário encontrado" />
            ) : (
              rows.map((user) => (
                <TableRow key={user.id} className="cursor-pointer hover:bg-white/5" onClick={() => navigate(`/users/${user.id}`)}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    {user.subscription
                      ? <Badge variant="outline" size="sm">{user.subscription.plan.name}</Badge>
                      : <span className="text-muted-foreground text-sm">—</span>}
                  </TableCell>
                  <TableCell>{user._count.students}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'success' : 'destructive'} size="sm">
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell><ChevronRight className="h-4 w-4 text-muted-foreground" /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.meta.totalPages > 1 && (
        <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} showEdges />
      )}
    </div>
  );
}
