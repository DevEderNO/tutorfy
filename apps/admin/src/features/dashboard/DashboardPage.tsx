import { useQuery } from '@tanstack/react-query';
import { usePageHeader } from '@/lib/page-header';
import { Users, TrendingUp, DollarSign, XCircle, CheckCircle, Sparkles } from 'lucide-react';
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
  category,
  label,
  value,
  sub,
  iconBg,
  iconColor,
  categoryColor,
  subColor,
}: {
  icon: React.ElementType;
  category: string;
  label: string;
  value: string;
  sub?: string;
  iconBg: string;
  iconColor: string;
  categoryColor: string;
  subColor?: string;
}) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <span className={`text-xs font-bold tracking-widest uppercase ${categoryColor}`}>
          {category}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {sub && (
        <p className={`text-xs mt-1.5 ${subColor ?? 'text-muted-foreground italic'}`}>{sub}</p>
      )}
    </div>
  );
}

export function DashboardPage() {
  usePageHeader({ title: 'Dashboard', subtitle: 'Visão geral da plataforma' });
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-5 space-y-3 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="h-3 w-16 rounded bg-muted" />
              </div>
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-7 w-16 rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="glass rounded-xl p-5 space-y-4 animate-pulse">
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 flex-1 rounded-xl bg-muted" />)}
          </div>
        </div>
      </div>
    );
  }

  const fmt = (n: number) =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          category="Financeiro"
          label="MRR"
          value={fmt(data?.mrr ?? 0)}
          sub={`ARR ${fmt(data?.arr ?? 0)}`}
          iconBg="bg-chart-3/15"
          iconColor="text-chart-3"
          categoryColor="text-chart-3"
        />
        <StatCard
          icon={Users}
          category="Equipe"
          label="Tutores ativos"
          value={String(data?.activeUsers ?? 0)}
          sub={`${data?.totalUsers ?? 0} cadastrados`}
          iconBg="bg-chart-2/15"
          iconColor="text-chart-2"
          categoryColor="text-chart-2"
        />
        <StatCard
          icon={TrendingUp}
          category="Crescimento"
          label="Assinantes"
          value={String(data?.subscribersByPlan.reduce((s, b) => s + b.count, 0) ?? 0)}
          sub="↑ Estável este mês"
          iconBg="bg-primary/15"
          iconColor="text-primary"
          categoryColor="text-primary"
          subColor="text-primary"
        />
        <StatCard
          icon={XCircle}
          category="Churn"
          label="Cancelamentos"
          value={String(data?.totalCanceled ?? 0)}
          sub={data?.totalCanceled === 0 ? 'Nenhuma perda recente' : undefined}
          iconBg="bg-destructive"
          iconColor="text-destructive-foreground"
          categoryColor="text-destructive"
          subColor="text-muted-foreground italic"
        />
      </div>

      {/* Assinantes por plano */}
      {data && data.subscribersByPlan.length > 0 && (
        <div className="glass rounded-xl p-5">
          <h2 className="text-lg font-bold text-foreground mb-4">Assinantes por plano</h2>
          <div className="flex flex-wrap gap-4">
            {(() => {
              const total = data.subscribersByPlan.reduce((s, b) => s + b.count, 0);
              return data.subscribersByPlan.map(({ plan, count }) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const isPremium = plan.slug === 'premium';
                return (
                  <div
                    key={plan.slug}
                    className={[
                      'relative rounded-xl p-4 min-w-[160px] flex-1 max-w-[220px]',
                      isPremium
                        ? 'bg-accent border border-chart-2/50'
                        : 'bg-card border border-border',
                    ].join(' ')}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <p
                        className={[
                          'text-xs font-bold tracking-widest uppercase',
                          isPremium ? 'text-chart-2' : 'text-muted-foreground',
                        ].join(' ')}
                      >
                        {plan.name}
                      </p>
                      {isPremium ? (
                        <Sparkles className="h-5 w-5 text-chart-2/60" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-muted-foreground/40" />
                      )}
                    </div>

                    {/* Count */}
                    <p className="text-3xl font-bold text-foreground mb-3">{count}</p>

                    {/* Progress bar */}
                    <div className="h-1 w-full rounded-full bg-muted overflow-hidden mb-2">
                      <div
                        className={[
                          'h-full rounded-full transition-all',
                          isPremium ? 'bg-chart-2' : 'bg-muted-foreground/50',
                        ].join(' ')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Percentage label */}
                    <p
                      className={[
                        'text-xs',
                        isPremium ? 'text-chart-2/80' : 'text-muted-foreground',
                      ].join(' ')}
                    >
                      {pct}% da base total
                    </p>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
