import { useState } from 'react';
import { usePageHeader } from '@/lib/page-header';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAdminAuth } from '@/lib/auth';
import {
  Badge,
  Button,
  Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter, ModalClose,
  Input, InputField,
  Select, SelectItem,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty,
  TableToolbar, TableSearch, TableFilter,
  Pagination,
  sortRows, filterRows, nextSortDirection,
  type SortState, type SortDirection,
} from '@tutorfy/ui';
import { toast } from 'sonner';

interface AdminRow {
  id: string; name: string; email: string; adminRole: 'SUPER_ADMIN' | 'SUPPORT';
  isActive: boolean; createdAt: string; lastLoginAt: string | null;
}

type SortKey = 'name' | 'email' | 'role' | 'lastLogin' | 'status';

const ROLE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'SUPPORT', label: 'Suporte' },
];
const STATUS_OPTIONS = [
  { value: 'true', label: 'Ativo' },
  { value: 'false', label: 'Inativo' },
];

const PAGE_SIZE = 10;

export function AdminsPage() {
  usePageHeader({ title: 'Admins', subtitle: 'Contas de acesso ao painel administrativo' });
  const qc = useQueryClient();
  const { admin: currentAdmin } = useAdminAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', adminRole: 'SUPPORT' });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortState, setSortState] = useState<SortState<SortKey>>({ column: null, direction: null });
  const [page, setPage] = useState(1);

  const { data: admins, isLoading } = useQuery({
    queryKey: ['admin', 'admins'],
    queryFn: async () => {
      const res = await api.get<{ data: AdminRow[] }>('/admin/admins');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/admin/admins', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'admins'] });
      toast.success('Admin criado com sucesso');
      setOpen(false); setForm({ name: '', email: '', password: '', adminRole: 'SUPPORT' });
    },
    onError: (err: unknown) => toast.error(
      err instanceof Object && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Erro ao criar admin'
        : 'Erro ao criar admin',
    ),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/admins/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'admins'] }); toast.success('Admin desativado'); },
    onError: (err: unknown) => toast.error(
      err instanceof Object && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Erro ao desativar'
        : 'Erro ao desativar',
    ),
  });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function handleSort(col: SortKey) {
    setSortState((prev) => ({
      column: col,
      direction: prev.column === col ? nextSortDirection(prev.direction) : 'asc',
    }));
    setPage(1);
  }

  function sortDir(col: SortKey): SortDirection {
    return sortState.column === col ? sortState.direction : null;
  }

  const filtered = filterRows(admins ?? [], search, ['name', 'email'] as (keyof AdminRow)[]).filter((a) => {
    if (roleFilter.length && !roleFilter.includes(a.adminRole)) return false;
    if (statusFilter.length && !statusFilter.includes(String(a.isActive))) return false;
    return true;
  });

  const sorted = sortRows(filtered, sortState, (a, col) => {
    if (col === 'name') return a.name;
    if (col === 'email') return a.email;
    if (col === 'role') return a.adminRole;
    if (col === 'lastLogin') return a.lastLoginAt ?? '';
    if (col === 'status') return a.isActive ? 1 : 0;
    return '';
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const rows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Novo admin
        </Button>
      </div>

      <TableToolbar>
        <TableSearch
          placeholder="Buscar por nome ou email…"
          value={search}
          onValueChange={(v) => { setSearch(v); setPage(1); }}
        />
        <TableFilter
          label="Role"
          options={ROLE_OPTIONS}
          value={roleFilter}
          onValueChange={(v) => { setRoleFilter(v); setPage(1); }}
          multiple
        />
        <TableFilter
          label="Status"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onValueChange={(v) => { setStatusFilter(v); setPage(1); }}
          multiple
        />
      </TableToolbar>

      <div className="glass rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead sortable sortDirection={sortDir('name')} onSort={() => handleSort('name')}>Nome</TableHead>
              <TableHead sortable sortDirection={sortDir('email')} onSort={() => handleSort('email')}>Email</TableHead>
              <TableHead sortable sortDirection={sortDir('role')} onSort={() => handleSort('role')}>Role</TableHead>
              <TableHead sortable sortDirection={sortDir('lastLogin')} onSort={() => handleSort('lastLogin')}>Último login</TableHead>
              <TableHead sortable sortDirection={sortDir('status')} onSort={() => handleSort('status')}>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(3)].map((_, i) => <TableRow key={i}>{[...Array(6)].map((_, j) => <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>)
            ) : !rows.length ? (
              <TableEmpty colSpan={6} message="Nenhum admin encontrado" />
            ) : (
              rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    {a.name}{a.id === currentAdmin?.id && <span className="text-xs text-primary ml-2">(você)</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.email}</TableCell>
                  <TableCell><Badge variant={a.adminRole === 'SUPER_ADMIN' ? 'primary' : 'default'} size="sm">{a.adminRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Suporte'}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleDateString('pt-BR') : '—'}</TableCell>
                  <TableCell><Badge variant={a.isActive ? 'success' : 'destructive'} size="sm">{a.isActive ? 'Ativo' : 'Inativo'}</Badge></TableCell>
                  <TableCell>
                    {a.id !== currentAdmin?.id && a.isActive && (
                      <Button variant="ghost" size="icon-sm" aria-label="Desativar admin" onClick={() => deactivateMutation.mutate(a.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} showEdges />
      )}

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent>
          <ModalHeader><ModalTitle>Novo admin</ModalTitle></ModalHeader>
          <ModalBody className="space-y-4">
            <InputField label="Nome"><Input value={form.name} onChange={set('name')} /></InputField>
            <InputField label="Email"><Input type="email" value={form.email} onChange={set('email')} /></InputField>
            <InputField label="Senha"><Input type="password" value={form.password} onChange={set('password')} /></InputField>
            <InputField label="Role">
              <Select value={form.adminRole} onValueChange={(v) => setForm((f) => ({ ...f, adminRole: v }))}>
                <SelectItem value="SUPPORT">Suporte</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              </Select>
            </InputField>
          </ModalBody>
          <ModalFooter>
            <ModalClose asChild><Button variant="secondary">Cancelar</Button></ModalClose>
            <Button variant="primary" disabled={createMutation.isPending} onClick={() => createMutation.mutate()}>
              {createMutation.isPending ? 'Criando...' : 'Criar'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
