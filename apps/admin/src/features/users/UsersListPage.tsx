import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Input, InputField } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';

interface UserRow {
  id: string; name: string; email: string; isActive: boolean; createdAt: string;
  _count: { students: number };
  subscription: { status: string; plan: { name: string; slug: string } } | null;
}
interface ListResult {
  data: UserRow[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function UsersListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isActiveFilter, setIsActiveFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { search, page, isActiveFilter }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (isActiveFilter) params.set('isActive', isActiveFilter);
      const res = await api.get<ListResult>(`/admin/users?${params}`);
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
        <p className="text-sm text-muted-foreground mt-1">Tutores cadastrados na plataforma</p>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <InputField>
            <Input
              placeholder="Buscar por nome ou email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leadingIcon={<Search className="h-4 w-4" />}
            />
          </InputField>
        </div>
        <div className="flex gap-2">
          {(['', 'true', 'false'] as const).map((v) => (
            <Button key={v} variant={isActiveFilter === v ? 'primary' : 'secondary'} size="sm"
              onClick={() => { setIsActiveFilter(v); setPage(1); }}>
              {v === '' ? 'Todos' : v === 'true' ? 'Ativos' : 'Inativos'}
            </Button>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead><TableHead>Email</TableHead>
              <TableHead>Plano</TableHead><TableHead>Alunos</TableHead>
              <TableHead>Status</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>{[...Array(6)].map((_, j) => <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>
              ))
            ) : !data?.data.length ? (
              <TableEmpty colSpan={6} message="Nenhum usuário encontrado" />
            ) : (
              data.data.map((user) => (
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
        <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
