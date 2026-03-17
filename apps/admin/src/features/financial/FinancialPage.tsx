import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Badge,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty,
  TableToolbar, TableFilterGroup,
  Pagination,
  sortRows, nextSortDirection,
  type SortState, type SortDirection, type FilterGroupDef,
} from '@tutorfy/ui';

interface Subscription {
  id: string; status: string; period: string; startedAt: string;
  user: { id: string; name: string; email: string };
  plan: { name: string; priceMonthly: number; priceAnnual: number };
}

const statusVariant: Record<string, 'success' | 'destructive' | 'warning' | 'default'> = {
  ACTIVE: 'success', CANCELED: 'destructive', PAST_DUE: 'warning', TRIALING: 'default',
};
const statusLabel: Record<string, string> = {
  ACTIVE: 'Ativo', CANCELED: 'Cancelado', PAST_DUE: 'Inadimplente', TRIALING: 'Trial',
};

const FILTER_DEFS: FilterGroupDef[] = [
  {
    key: 'status',
    label: 'Status',
    multiple: true,
    options: [
      { value: 'ACTIVE', label: 'Ativo' },
      { value: 'TRIALING', label: 'Trial' },
      { value: 'PAST_DUE', label: 'Inadimplente' },
      { value: 'CANCELED', label: 'Cancelado' },
    ],
  },
  {
    key: 'period',
    label: 'Período',
    options: [
      { value: 'MONTHLY', label: 'Mensal' },
      { value: 'ANNUAL', label: 'Anual' },
    ],
  },
];

type SortKey = 'user' | 'plan' | 'period' | 'value' | 'startedAt';

export function FinancialPage() {
  const [page, setPage] = useState(1);
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>({ status: [], period: [] });
  const [sortState, setSortState] = useState<SortState<SortKey>>({ column: null, direction: null });

  const statusParam = filterValues.status?.length === 1 ? filterValues.status[0] : '';
  const periodParam = filterValues.period?.length === 1 ? filterValues.period[0] : '';

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'financial', 'subscriptions', { page, statusParam, periodParam }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (statusParam) params.set('status', statusParam);
      if (periodParam) params.set('period', periodParam);
      const res = await api.get<{ data: Subscription[]; meta: { total: number; page: number; totalPages: number } }>(
        `/admin/financial/subscriptions?${params}`,
      );
      return res.data;
    },
  });

  const fmt = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  function handleSort(col: SortKey) {
    setSortState((prev) => ({
      column: col,
      direction: prev.column === col ? nextSortDirection(prev.direction) : 'asc',
    }));
  }

  function sortDir(col: SortKey): SortDirection {
    return sortState.column === col ? sortState.direction : null;
  }

  const rows = sortRows(data?.data ?? [], sortState, (row, col) => {
    if (col === 'user') return row.user.name;
    if (col === 'plan') return row.plan.name;
    if (col === 'period') return row.period;
    if (col === 'value') return row.period === 'MONTHLY' ? row.plan.priceMonthly : row.plan.priceAnnual;
    if (col === 'startedAt') return row.startedAt;
    return '';
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
        <p className="text-sm text-muted-foreground mt-1">Assinaturas e receita da plataforma</p>
      </div>

      <TableToolbar>
        <TableFilterGroup
          filters={FILTER_DEFS}
          values={filterValues}
          onValuesChange={(v) => { setFilterValues(v); setPage(1); }}
        />
      </TableToolbar>

      <div className="glass rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead sortable sortDirection={sortDir('user')} onSort={() => handleSort('user')}>Tutor</TableHead>
              <TableHead sortable sortDirection={sortDir('plan')} onSort={() => handleSort('plan')}>Plano</TableHead>
              <TableHead sortable sortDirection={sortDir('period')} onSort={() => handleSort('period')}>Período</TableHead>
              <TableHead sortable sortDirection={sortDir('value')} onSort={() => handleSort('value')}>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead sortable sortDirection={sortDir('startedAt')} onSort={() => handleSort('startedAt')}>Desde</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => <TableRow key={i}>{[...Array(6)].map((_, j) => <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>)
            ) : !rows.length ? (
              <TableEmpty colSpan={6} message="Nenhuma assinatura encontrada" />
            ) : (
              rows.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{sub.user.name}</p>
                      <p className="text-xs text-muted-foreground">{sub.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{sub.plan.name}</TableCell>
                  <TableCell>{sub.period === 'MONTHLY' ? 'Mensal' : 'Anual'}</TableCell>
                  <TableCell className="font-medium">{fmt(sub.period === 'MONTHLY' ? sub.plan.priceMonthly : sub.plan.priceAnnual)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[sub.status] ?? 'default'} size="sm">
                      {statusLabel[sub.status] ?? sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(sub.startedAt).toLocaleDateString('pt-BR')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.meta.totalPages > 1 && (
        <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} showEdges />
      )}
    </div>
  );
}
