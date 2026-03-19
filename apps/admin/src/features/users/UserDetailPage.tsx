import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  CalendarDays,
  DollarSign,
  Bot,
  Users,
  ShieldCheck,
  ShieldOff,
  CreditCard,
} from 'lucide-react';
import { usePageHeader } from '@/lib/page-header';
import { api } from '@/lib/api';
import { useAdminAuth } from '@/lib/auth';
import {
  Avatar,
  Badge,
  Button,
  InputField,
  Select,
  SelectItem,
  StatusLabel,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsPanel,
} from '@tutorfy/ui';
import { toast } from 'sonner';

interface Plan { id: string; name: string; slug: string }
interface UserDetail {
  id: string; name: string; email: string; isActive: boolean; createdAt: string;
  _count: { students: number; classSessions: number; payments: number };
  subscription: {
    id: string; status: string; period: string;
    plan: Plan & { maxStudents: number | null; aiEnabled: boolean };
  } | null;
}

const SUBSCRIPTION_STATUS_MAP: Record<string, 'active' | 'inactive' | 'pending' | 'cancelled'> = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
};

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
      <span className="text-sm font-medium text-foreground">{children}</span>
    </div>
  );
}

export function UserDetailPage() {
  usePageHeader({ title: 'Detalhes do tutor', subtitle: 'Perfil, assinatura e ações administrativas', backTo: '/users' });
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { isSuperAdmin } = useAdminAuth();
  const [selectedPlanId, setSelectedPlanId] = useState('');

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: async () => {
      const res = await api.get<{ data: UserDetail }>(`/admin/users/${id}`);
      return res.data.data;
    },
  });

  const { data: plans } = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: async () => {
      const res = await api.get<{ data: Plan[] }>('/admin/plans');
      return res.data.data;
    },
    enabled: isSuperAdmin,
  });

  const changePlanMutation = useMutation({
    mutationFn: (planId: string) => api.patch(`/admin/users/${id}/plan`, { planId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users', id] });
      toast.success('Plano atualizado');
      setSelectedPlanId('');
    },
    onError: (err: unknown) => toast.error(
      err instanceof Object && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Erro ao atualizar plano'
        : 'Erro ao atualizar plano',
    ),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (isActive: boolean) => api.patch(`/admin/users/${id}/status`, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users', id] });
      toast.success('Status atualizado');
    },
    onError: (err: unknown) => toast.error(
      err instanceof Object && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Erro ao atualizar status'
        : 'Erro ao atualizar status',
    ),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-pulse">
        {/* profile */}
        <div className="glass rounded-xl p-6 flex items-start gap-5">
          <div className="h-16 w-16 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="h-3 w-52 rounded bg-muted" />
            <div className="h-3 w-32 rounded bg-muted mt-3" />
          </div>
        </div>
        {/* kpis */}
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="h-3 w-14 rounded bg-muted" />
              </div>
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-7 w-12 rounded bg-muted" />
            </div>
          ))}
        </div>
        {/* tabs */}
        <div className="glass rounded-xl h-48" />
      </div>
    );
  }

  if (!user) {
    return <div className="text-muted-foreground">Usuário não encontrado</div>;
  }

  const joinedAt = new Date(user.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const subStatus = user.subscription
    ? (SUBSCRIPTION_STATUS_MAP[user.subscription.status] ?? 'inactive')
    : null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* ── Perfil ── */}
      <div className="relative glass rounded-xl p-6 flex items-start gap-5 overflow-hidden">
        {/* glow accent */}
        <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />

        <div className="relative">
          <Avatar name={user.name} size="xl" shape="circle" />
          {user.isActive && (
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-chart-1 ring-2 ring-card" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-foreground truncate">{user.name}</h2>
            <StatusLabel
              status={user.isActive ? 'active' : 'inactive'}
              label={user.isActive ? 'Ativo' : 'Inativo'}
              size="sm"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            Membro desde {joinedAt}
          </p>
        </div>

        {user.subscription && (
          <Badge variant="primary" className="shrink-0 self-start">
            {user.subscription.plan.name}
          </Badge>
        )}
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users,      category: 'Alunos',      label: 'Total cadastrados', value: user._count.students,      iconBg: 'bg-chart-2/15', iconColor: 'text-chart-2', catColor: 'text-chart-2' },
          { icon: BookOpen,   category: 'Aulas',        label: 'Sessões realizadas', value: user._count.classSessions, iconBg: 'bg-primary/15',  iconColor: 'text-primary',  catColor: 'text-primary'  },
          { icon: DollarSign, category: 'Pagamentos',   label: 'Transações',         value: user._count.payments,      iconBg: 'bg-chart-3/15', iconColor: 'text-chart-3', catColor: 'text-chart-3' },
        ].map(({ icon: Icon, category, label, value, iconBg, iconColor, catColor }) => (
          <div key={category} className="glass rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <span className={`text-[10px] font-bold tracking-widest uppercase ${catColor}`}>
                {category}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="subscription" variant="glass">
        <TabsList>
          <TabsTrigger value="subscription">
            <CreditCard className="h-3.5 w-3.5" />
            Assinatura
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="actions">
              <ShieldCheck className="h-3.5 w-3.5" />
              Ações
            </TabsTrigger>
          )}
        </TabsList>

        {/* ── Tab: Assinatura ── */}
        <TabsPanel value="subscription">
          <div className="glass rounded-xl p-5 space-y-5">
            {user.subscription ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
                  <InfoRow label="Plano">
                    {user.subscription.plan.name}
                  </InfoRow>
                  <InfoRow label="Período">
                    {user.subscription.period === 'MONTHLY' ? 'Mensal' : 'Anual'}
                  </InfoRow>
                  <InfoRow label="Status">
                    {subStatus && (
                      <StatusLabel
                        status={subStatus}
                        label={user.subscription.status}
                        size="sm"
                      />
                    )}
                  </InfoRow>
                  <InfoRow label="Limite de alunos">
                    {user.subscription.plan.maxStudents ?? 'Ilimitado'}
                  </InfoRow>
                  <InfoRow label="Inteligência Artificial">
                    <span className="flex items-center gap-1.5">
                      <Bot className={`h-3.5 w-3.5 ${user.subscription.plan.aiEnabled ? 'text-chart-1' : 'text-muted-foreground'}`} />
                      {user.subscription.plan.aiEnabled ? 'Habilitada' : 'Desabilitada'}
                    </span>
                  </InfoRow>
                </div>

                {isSuperAdmin && plans && (
                  <div className="pt-4 border-t border-border/60 flex items-end gap-3">
                    <InputField label="Alterar plano" className="flex-1 max-w-[220px]">
                      <Select
                        value={selectedPlanId || user.subscription.plan.id}
                        onValueChange={setSelectedPlanId}
                        size="sm"
                      >
                        {plans.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </Select>
                    </InputField>
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={!selectedPlanId || changePlanMutation.isPending}
                      onClick={() => changePlanMutation.mutate(selectedPlanId)}
                    >
                      Salvar
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-1">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Sem assinatura ativa</p>
                <p className="text-xs text-muted-foreground">Este tutor ainda não possui um plano contratado.</p>

                {isSuperAdmin && plans && (
                  <div className="flex items-end gap-3 mt-4">
                    <InputField label="Atribuir plano" className="max-w-[220px]">
                      <Select
                        value={selectedPlanId}
                        onValueChange={setSelectedPlanId}
                        size="sm"
                      >
                        {plans.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </Select>
                    </InputField>
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={!selectedPlanId || changePlanMutation.isPending}
                      onClick={() => changePlanMutation.mutate(selectedPlanId)}
                    >
                      Atribuir
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsPanel>

        {/* ── Tab: Ações (superAdmin) ── */}
        {isSuperAdmin && (
          <TabsPanel value="actions">
            <div className="glass rounded-xl p-5 space-y-4">
              <div className={[
                'relative flex items-start gap-4 p-5 rounded-xl overflow-hidden',
                user.isActive ? 'gradient-danger' : 'bg-primary/10 border border-primary/20',
              ].join(' ')}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${user.isActive ? 'bg-white/10' : 'bg-primary/15'}`}>
                  {user.isActive
                    ? <ShieldOff className="h-5 w-5 text-white" />
                    : <ShieldCheck className="h-5 w-5 text-primary" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${user.isActive ? 'text-white' : 'text-foreground'}`}>
                    {user.isActive ? 'Desativar conta' : 'Ativar conta'}
                  </p>
                  <p className={`text-xs mt-0.5 ${user.isActive ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {user.isActive
                      ? 'O tutor perderá acesso à plataforma imediatamente.'
                      : 'O tutor voltará a ter acesso à plataforma.'
                    }
                  </p>
                </div>
                <Button
                  variant={user.isActive ? 'secondary' : 'primary'}
                  size="sm"
                  disabled={toggleStatusMutation.isPending}
                  onClick={() => toggleStatusMutation.mutate(!user.isActive)}
                >
                  {user.isActive ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </div>
          </TabsPanel>
        )}
      </Tabs>
    </div>
  );
}
