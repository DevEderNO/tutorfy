import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';

interface Subscription {
  id: string; status: string; period: string; startedAt: string;
  user: { id: string; name: string; email: string };
  plan: { name: string; priceMonthly: number; priceAnnual: number };
}
const STATUS_OPTIONS = ['', 'ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING'];
const PERIOD_OPTIONS = ['', 'MONTHLY', 'ANNUAL'];
const statusVariant: Record<string, 'success' | 'destructive' | 'warning' | 'default'> = {
  ACTIVE: 'success', CANCELED: 'destructive', PAST_DUE: 'warning', TRIALING: 'default',
};

export function FinancialPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [period, setPeriod] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'financial', 'subscriptions', { page, status, period }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (status) params.set('status', status);
      if (period) params.set('period', period);
      const res = await api.get<{ data: Subscription[]; meta: { total: number; page: number; totalPages: number } }>(
        `/admin/financial/subscriptions?${params}`,
      );
      return res.data;
    },
  });

  const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
        <p className="text-sm text-muted-foreground mt-1">Assinaturas e receita da plataforma</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <Button key={s} variant={status === s ? 'primary' : 'secondary'} size="sm" onClick={() => { setStatus(s); setPage(1); }}>
              {s || 'Todos status'}
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          {PERIOD_OPTIONS.map((p) => (
            <Button key={p} variant={period === p ? 'primary' : 'secondary'} size="sm" onClick={() => { setPeriod(p); setPage(1); }}>
              {p === '' ? 'Todos períodos' : p === 'MONTHLY' ? 'Mensal' : 'Anual'}
            </Button>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tutor</TableHead><TableHead>Plano</TableHead>
              <TableHead>Período</TableHead><TableHead>Valor</TableHead>
              <TableHead>Status</TableHead><TableHead>Desde</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => <TableRow key={i}>{[...Array(6)].map((_, j) => <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>)
            ) : !data?.data.length ? (
              <TableEmpty colSpan={6} message="Nenhuma assinatura encontrada" />
            ) : (
              data.data.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell><div><p className="font-medium">{sub.user.name}</p><p className="text-xs text-muted-foreground">{sub.user.email}</p></div></TableCell>
                  <TableCell>{sub.plan.name}</TableCell>
                  <TableCell>{sub.period === 'MONTHLY' ? 'Mensal' : 'Anual'}</TableCell>
                  <TableCell className="font-medium">{fmt(sub.period === 'MONTHLY' ? sub.plan.priceMonthly : sub.plan.priceAnnual)}</TableCell>
                  <TableCell><Badge variant={statusVariant[sub.status] ?? 'default'} size="sm">{sub.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(sub.startedAt).toLocaleDateString('pt-BR')}</TableCell>
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
