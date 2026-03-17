import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@tutorfy/ui';
import { Button } from '@tutorfy/ui';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter, ModalClose } from '@tutorfy/ui';
import { Input, InputField } from '@tutorfy/ui';
import { toast } from 'sonner';

interface Plan {
  id: string; name: string; slug: string; maxStudents: number | null;
  aiEnabled: boolean; priceMonthly: number; priceAnnual: number; isActive: boolean;
  _count: { subscriptions: number };
}
interface PlanFormData {
  name: string; slug: string; maxStudents: string;
  aiEnabled: boolean; priceMonthly: string; priceAnnual: string;
}
const emptyForm: PlanFormData = { name: '', slug: '', maxStudents: '', aiEnabled: false, priceMonthly: '0', priceAnnual: '0' };

export function PlansPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState<PlanFormData>(emptyForm);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: async () => {
      const res = await api.get<{ data: Plan[] }>('/admin/plans');
      return res.data.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: PlanFormData) => {
      const payload = {
        name: data.name, slug: data.slug,
        maxStudents: data.maxStudents ? parseInt(data.maxStudents) : null,
        aiEnabled: data.aiEnabled,
        priceMonthly: parseFloat(data.priceMonthly) || 0,
        priceAnnual: parseFloat(data.priceAnnual) || 0,
      };
      return editing ? api.put(`/admin/plans/${editing.id}`, payload) : api.post('/admin/plans', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'plans'] });
      toast.success(editing ? 'Plano atualizado' : 'Plano criado');
      setOpen(false); setEditing(null); setForm(emptyForm);
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Erro ao salvar plano'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/plans/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'plans'] }); toast.success('Plano desativado'); },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Erro ao desativar'),
  });

  const openEdit = (plan: Plan) => {
    setEditing(plan);
    setForm({ name: plan.name, slug: plan.slug, maxStudents: plan.maxStudents != null ? String(plan.maxStudents) : '', aiEnabled: plan.aiEnabled, priceMonthly: String(plan.priceMonthly), priceAnnual: String(plan.priceAnnual) });
    setOpen(true);
  };

  const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const set = (field: keyof PlanFormData) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Planos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie os planos da plataforma</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Novo plano
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="glass rounded-xl h-40 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans?.map((plan) => (
            <div key={plan.id} className="glass rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-foreground">{plan.name}</h2>
                  <p className="text-xs text-muted-foreground font-mono">{plan.slug}</p>
                </div>
                <Badge variant={plan.isActive ? 'success' : 'destructive'} size="sm">{plan.isActive ? 'Ativo' : 'Inativo'}</Badge>
              </div>
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">Mensal: <span className="text-foreground font-medium">{fmt(plan.priceMonthly)}</span></p>
                <p className="text-muted-foreground">Anual: <span className="text-foreground font-medium">{fmt(plan.priceAnnual)}</span></p>
                <p className="text-muted-foreground">Alunos: <span className="text-foreground font-medium">{plan.maxStudents ?? 'Ilimitado'}</span></p>
                <p className="text-muted-foreground">IA: <span className="text-foreground font-medium">{plan.aiEnabled ? 'Sim' : 'Não'}</span></p>
                <p className="text-muted-foreground">Assinantes: <span className="text-foreground font-medium">{plan._count.subscriptions}</span></p>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(plan)} aria-label="Editar plano"><Pencil className="h-3.5 w-3.5" /></Button>
                {plan.slug !== 'free' && plan.isActive && (
                  <Button variant="ghost" size="icon-sm" onClick={() => deactivateMutation.mutate(plan.id)} aria-label="Desativar plano">
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm(emptyForm); } }}>
        <ModalContent>
          <ModalHeader><ModalTitle>{editing ? 'Editar plano' : 'Novo plano'}</ModalTitle></ModalHeader>
          <ModalBody className="space-y-4">
            <InputField label="Nome"><Input value={form.name} onChange={set('name')} /></InputField>
            {!editing && <InputField label="Slug"><Input value={form.slug} onChange={set('slug')} placeholder="ex: pro-monthly" /></InputField>}
            <InputField label="Limite de alunos (vazio = ilimitado)"><Input type="number" value={form.maxStudents} onChange={set('maxStudents')} /></InputField>
            <InputField label="Preço mensal (R$)"><Input type="number" value={form.priceMonthly} onChange={set('priceMonthly')} /></InputField>
            <InputField label="Preço anual (R$)"><Input type="number" value={form.priceAnnual} onChange={set('priceAnnual')} /></InputField>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="aiEnabled" checked={form.aiEnabled} onChange={(e) => setForm((f) => ({ ...f, aiEnabled: e.target.checked }))} className="accent-primary" />
              <label htmlFor="aiEnabled" className="text-sm text-foreground">IA habilitada</label>
            </div>
          </ModalBody>
          <ModalFooter>
            <ModalClose asChild><Button variant="secondary">Cancelar</Button></ModalClose>
            <Button variant="primary" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate(form)}>
              {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
