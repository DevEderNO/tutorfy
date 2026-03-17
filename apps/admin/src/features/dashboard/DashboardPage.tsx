import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, DollarSign, XCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface Summary {
  mrr: number;
  arr: number;
  totalUsers: number;
  activeUsers: number;
  totalCanceled: number;
  subscribersByPlan: Array<{ plan: { name: string; slug: string }; count: number }>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="glass rounded-xl p-5 flex items-start gap-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'financial', 'summary'],
    queryFn: async () => {
      const res = await api.get<{ data: Summary }>('/admin/financial/summary');
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-card rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const fmt = (n: number) =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral da plataforma</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="MRR" value={fmt(data?.mrr ?? 0)} sub={`ARR ${fmt(data?.arr ?? 0)}`} color="bg-primary" />
        <StatCard icon={Users} label="Tutores ativos" value={String(data?.activeUsers ?? 0)} sub={`${data?.totalUsers ?? 0} cadastrados`} color="bg-info" />
        <StatCard icon={TrendingUp} label="Assinantes" value={String(data?.subscribersByPlan.reduce((s, b) => s + b.count, 0) ?? 0)} color="bg-success" />
        <StatCard icon={XCircle} label="Cancelamentos" value={String(data?.totalCanceled ?? 0)} color="bg-destructive" />
      </div>

      {/* Assinantes por plano */}
      {data && data.subscribersByPlan.length > 0 && (
        <div className="glass rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Assinantes por plano</h2>
          <div className="flex flex-wrap gap-3">
            {data.subscribersByPlan.map(({ plan, count }) => (
              <div key={plan.slug} className="bg-card rounded-lg px-4 py-3 min-w-[120px]">
                <p className="text-xs text-muted-foreground capitalize">{plan.name}</p>
                <p className="text-xl font-bold text-foreground">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
