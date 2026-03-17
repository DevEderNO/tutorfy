import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAdminAuth } from '@/lib/auth';
import { Badge } from '@tutorfy/ui';
import { Button } from '@tutorfy/ui';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter, ModalClose } from '@tutorfy/ui';
import { Input, InputField } from '@tutorfy/ui';
import { Select, SelectItem } from '@tutorfy/ui';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@tutorfy/ui';
import { toast } from 'sonner';

interface AdminRow {
  id: string; name: string; email: string; adminRole: 'SUPER_ADMIN' | 'SUPPORT';
  isActive: boolean; createdAt: string; lastLoginAt: string | null;
}

export function AdminsPage() {
  const qc = useQueryClient();
  const { admin: currentAdmin } = useAdminAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', adminRole: 'SUPPORT' });

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
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Erro ao criar admin'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/admins/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'admins'] }); toast.success('Admin desativado'); },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Erro ao desativar'),
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admins</h1>
          <p className="text-sm text-muted-foreground mt-1">Contas de acesso ao painel administrativo</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Novo admin
        </Button>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead><TableHead>Email</TableHead>
              <TableHead>Role</TableHead><TableHead>Último login</TableHead>
              <TableHead>Status</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(3)].map((_, i) => <TableRow key={i}>{[...Array(6)].map((_, j) => <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>)
            ) : !admins?.length ? (
              <TableEmpty colSpan={6} message="Nenhum admin cadastrado" />
            ) : (
              admins.map((a) => (
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
