import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, CalendarDays, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';
import { useAdminAuth } from '@/lib/auth';
import { Badge } from '@tutorfy/ui';
import { Button } from '@tutorfy/ui';
import { Select, SelectItem } from '@tutorfy/ui';
import { InputField } from '@tutorfy/ui';
import { toast } from 'sonner';

interface Plan { id: string; name: string; slug: string }
interface UserDetail {
  id: string; name: string; email: string; isActive: boolean; createdAt: string;
  _count: { students: number; classSessions: number; payments: number };
  subscription: { id: string; status: string; period: string; plan: Plan & { maxStudents: number | null; aiEnabled: boolean } } | null;
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users', id] }); toast.success('Plano atualizado'); },
    onError: (err: unknown) => toast.error(
      err instanceof Object && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Erro ao atualizar plano'
        : 'Erro ao atualizar plano',
    ),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (isActive: boolean) => api.patch(`/admin/users/${id}/status`, { isActive }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users', id] }); toast.success('Status atualizado'); },
    onError: (err: unknown) => toast.error(
      err instanceof Object && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Erro ao atualizar status'
        : 'Erro ao atualizar status',
    ),
  });

  if (isLoading) return <div className="text-muted-foreground">Carregando...</div>;
  if (!user) return <div className="text-muted-foreground">Usuário não encontrado</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/users')} aria-label="Voltar">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Badge variant={user.isActive ? 'success' : 'destructive'} className="ml-auto">
          {user.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: BookOpen, label: 'Alunos', value: user._count.students },
          { icon: CalendarDays, label: 'Aulas', value: user._count.classSessions },
          { icon: DollarSign, label: 'Pagamentos', value: user._count.payments },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="glass rounded-xl p-4 flex items-center gap-3">
            <Icon className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Assinatura</h2>
        {user.subscription ? (
          <div className="flex flex-wrap gap-4 text-sm">
            <div><span className="text-muted-foreground">Plano: </span><span className="font-medium">{user.subscription.plan.name}</span></div>
            <div><span className="text-muted-foreground">Período: </span><span className="font-medium">{user.subscription.period === 'MONTHLY' ? 'Mensal' : 'Anual'}</span></div>
            <div><span className="text-muted-foreground">Status: </span><Badge variant={user.subscription.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">{user.subscription.status}</Badge></div>
            <div><span className="text-muted-foreground">Limite alunos: </span><span className="font-medium">{user.subscription.plan.maxStudents ?? 'Ilimitado'}</span></div>
            <div><span className="text-muted-foreground">IA: </span><span className="font-medium">{user.subscription.plan.aiEnabled ? 'Habilitada' : 'Desabilitada'}</span></div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sem assinatura</p>
        )}

        {isSuperAdmin && plans && (
          <div className="flex gap-3 items-end pt-2 border-t border-border">
            <InputField label="Alterar plano" className="flex-1 max-w-[200px]">
              <Select
                value={selectedPlanId || user.subscription?.plan.id || ''}
                onValueChange={setSelectedPlanId}
                size="sm"
              >
                {plans.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </Select>
            </InputField>
            <Button size="sm" variant="primary"
              disabled={!selectedPlanId || changePlanMutation.isPending}
              onClick={() => changePlanMutation.mutate(selectedPlanId)}>
              Salvar
            </Button>
          </div>
        )}
      </div>

      {isSuperAdmin && (
        <div className="glass rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Ações</h2>
          <Button variant={user.isActive ? 'destructive' : 'primary'} size="sm"
            disabled={toggleStatusMutation.isPending}
            onClick={() => toggleStatusMutation.mutate(!user.isActive)}>
            {user.isActive ? 'Desativar conta' : 'Ativar conta'}
          </Button>
        </div>
      )}
    </div>
  );
}
