import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Trash2, Pencil, Users, Phone, Mail } from 'lucide-react';
import { useGuardians, useDeleteGuardian } from './hooks/useGuardians';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Header } from '@/components/layout/Header';
import {
  Button, Avatar,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty,
  TableToolbar, TableSearch, Pagination,
} from '@tutorfy/ui';

const PAGE_SIZE = 10;

export function GuardiansListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);

  const deleteGuardian = useDeleteGuardian();

  const { data: result, isLoading } = useGuardians({ page, limit: PAGE_SIZE, search, sortBy, sortDir });
  const guardians = result?.data ?? [];
  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearchChange = useCallback((v: string) => setSearchInput(v), []);

  function handleSort(col: 'name' | 'createdAt') {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(col); setSortDir('asc'); }
    setPage(1);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Responsáveis"
        actions={
          <Button onClick={() => navigate('/guardians/new')}>
            <UserPlus />
            <span className="hidden sm:inline">Novo Responsável</span>
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-7xl p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 hover:border-primary/30 transition-colors">
            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total de responsáveis</p>
              <p className="text-2xl font-black text-foreground mt-0.5">{total}</p>
            </div>
          </div>
          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 hover:border-primary/30 transition-colors">
            <div className="size-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Mail className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Com e-mail</p>
              <p className="text-2xl font-black text-foreground mt-0.5">
                {guardians.filter((g) => g.email).length}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
          <div className="p-4 border-b border-white/5">
            <TableToolbar>
              <TableSearch
                value={searchInput}
                onValueChange={handleSearchChange}
                placeholder="Buscar por nome, e-mail ou telefone..."
              />
              {searchInput && (
                <Button variant="ghost" size="sm" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}>
                  Limpar
                </Button>
              )}
            </TableToolbar>
          </div>

          <Table variant="ghost">
            <TableHeader>
              <TableRow>
                <TableHead sortable sortDirection={sortBy === 'name' ? sortDir : null} onSort={() => handleSort('name')}>
                  Nome
                </TableHead>
                <TableHead className="hidden md:table-cell">Contato</TableHead>
                <TableHead className="hidden lg:table-cell">CPF</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  </td>
                </tr>
              ) : guardians.length === 0 ? (
                <TableEmpty
                  colSpan={4}
                  message="Nenhum responsável encontrado"
                  description={search ? 'Tente ajustar a busca.' : undefined}
                  icon={!search ? <Users className="size-8" /> : undefined}
                />
              ) : (
                guardians.map((guardian) => (
                  <TableRow key={guardian.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={guardian.name} size="md" />
                        <span className="font-semibold text-foreground">{guardian.name}</span>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      {guardian.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Phone className="size-3.5 shrink-0" />
                          {guardian.phone}
                        </div>
                      )}
                      {guardian.email && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <Mail className="size-3 shrink-0" />
                          {guardian.email}
                        </div>
                      )}
                      {!guardian.phone && !guardian.email && <span className="text-muted-foreground">—</span>}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">{guardian.cpf || '—'}</span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon-sm" variant="ghost" aria-label="Editar" asChild>
                          <Link to={`/guardians/${guardian.id}/edit`}>
                            <Pencil />
                          </Link>
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Excluir"
                          onClick={() => setDeleting({ id: guardian.id, name: guardian.name })}
                          className="hover:text-destructive"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {!isLoading && total > 0 && (
            <div className="px-4 py-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} de {total} responsável{total !== 1 ? 'is' : ''}
              </span>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} size="sm" showEdges={totalPages > 5} />
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) { deleteGuardian.mutate(deleting.id); setDeleting(null); }
        }}
        title="Excluir Responsável"
        description={
          <>
            Deseja realmente excluir o responsável{' '}
            <span className="font-bold text-white">"{deleting?.name}"</span>?
          </>
        }
        confirmLabel="Sim, Excluir"
        cancelLabel="Agora não"
        variant="danger"
        icon={Trash2}
      />
    </div>
  );
}
