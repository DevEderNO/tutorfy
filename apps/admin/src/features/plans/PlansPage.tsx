import { useState } from 'react';
import { usePageHeader } from '@/lib/page-header';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Users, Bot, TrendingUp, Infinity } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge, Button, Checkbox, Input, InputField, Modal, ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@tutorfy/ui';
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

const PLAN_ACCENT: Record<string, string> = {
  free:    'from-chart-4/80 to-chart-4/20',
  basic:   'from-chart-2/80 to-chart-2/20',
  pro:     'from-primary/80  to-primary/20',
  premium: 'from-chart-3/80 to-chart-3/20',
};

const PLAN_GLOW: Record<string, string> = {
  free:    'bg-chart-4/5',
  basic:   'bg-chart-2/5',
  pro:     'bg-primary/5',
  premium: 'bg-chart-3/5',
};

function planAccent(slug: string) {
  return PLAN_ACCENT[slug] ?? 'from-muted-foreground/40 to-muted-foreground/10';
}
function planGlow(slug: string) {
  return PLAN_GLOW[slug] ?? '';
}

export function PlansPage() {
  usePageHeader({ title: 'Planos', subtitle: 'Gerencie os planos da plataforma' });
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
    onError: (err: unknown) => toast.error(
      err instanceof Object && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Erro ao salvar plano'
        : 'Erro ao salvar plano',
    ),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/plans/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'plans'] }); toast.success('Plano desativado'); },
    onError: (err: unknown) => toast.error(
      err instanceof Object && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Erro ao desativar'
        : 'Erro ao desativar',
    ),
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
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Novo plano
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-xl overflow-hidden animate-pulse">
              <div className="h-1 bg-muted" />
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <div className="h-4 w-20 rounded bg-muted" />
                    <div className="h-3 w-14 rounded bg-muted" />
                  </div>
                  <div className="h-5 w-12 rounded-full bg-muted" />
                </div>
                <div className="space-y-1">
                  <div className="h-7 w-28 rounded bg-muted" />
                  <div className="h-3 w-20 rounded bg-muted" />
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-24 rounded-full bg-muted" />
                  <div className="h-6 w-20 rounded-full bg-muted" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/40">
                  <div className="h-3 w-24 rounded bg-muted" />
                  <div className="flex gap-1">
                    <div className="h-7 w-7 rounded bg-muted" />
                    <div className="h-7 w-7 rounded bg-muted" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans?.map((plan) => (
            <div
              key={plan.id}
              className={`relative glass rounded-xl overflow-hidden flex flex-col ${!plan.isActive ? 'opacity-60' : ''}`}
            >
              {/* accent strip */}
              <div className={`h-1 w-full bg-gradient-to-r ${planAccent(plan.slug)}`} />

              {/* subtle glow behind content */}
              <div className={`absolute inset-0 ${planGlow(plan.slug)} pointer-events-none`} />

              <div className="relative flex flex-col flex-1 p-5 gap-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-foreground leading-tight">{plan.name}</h2>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{plan.slug}</p>
                  </div>
                  <Badge variant={plan.isActive ? 'success' : 'destructive'} size="sm" className="shrink-0">
                    {plan.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                {/* Price hero */}
                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">{fmt(plan.priceMonthly)}</span>
                    <span className="text-xs text-muted-foreground">/ mês</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {fmt(plan.priceAnnual)} <span className="opacity-60">/ ano</span>
                  </p>
                </div>

                {/* Feature chips */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {plan.maxStudents != null ? `${plan.maxStudents} alunos` : (
                      <><Infinity className="h-3 w-3" /> ilimitado</>
                    )}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${plan.aiEnabled ? 'bg-chart-1/10 text-chart-1' : 'bg-muted/60 text-muted-foreground'}`}>
                    <Bot className="h-3 w-3" />
                    IA {plan.aiEnabled ? 'ativa' : 'inativa'}
                  </span>
                </div>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/40">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <strong className="text-foreground">{plan._count.subscriptions}</strong> assinantes
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(plan)} aria-label="Editar plano">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {plan.slug !== 'free' && plan.isActive && (
                      <Button variant="ghost" size="icon-sm" onClick={() => deactivateMutation.mutate(plan.id)} aria-label="Desativar plano">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
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
            <Checkbox
              id="aiEnabled"
              checked={form.aiEnabled}
              onCheckedChange={(checked) => setForm((f) => ({ ...f, aiEnabled: checked === true }))}
              label="IA habilitada"
            />
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
