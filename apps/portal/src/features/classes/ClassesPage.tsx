import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useSelectedStudent } from '@/lib/selected-student';
import { Badge, Button, Pagination } from '@tutorfy/ui';

interface ClassSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED' | 'MISSED';
  content: string | null;
  homework: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: 'Agendada',
  COMPLETED: 'Realizada',
  CANCELED: 'Cancelada',
  MISSED: 'Faltou',
};

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'primary'> = {
  SCHEDULED: 'primary',
  COMPLETED: 'success',
  CANCELED: 'destructive',
  MISSED: 'warning',
};

function formatTime(iso: string) {
  return format(parseISO(iso), 'HH:mm');
}

export function ClassesPage() {
  const [filter, setFilter] = useState<'upcoming' | 'history' | 'all'>('upcoming');
  const [page, setPage] = useState(1);
  const { selectedId } = useSelectedStudent();

  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'classes', selectedId, filter, page],
    enabled: !!selectedId,
    queryFn: async () => {
      const res = await api.get<{ data: ClassSession[]; meta: { total: number; totalPages: number } }>(
        `/portal/students/${selectedId}/classes?filter=${filter}&page=${page}&limit=10`,
      );
      return res.data;
    },
  });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        {(['upcoming', 'history', 'all'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => { setFilter(f); setPage(1); }}
          >
            {f === 'upcoming' ? 'Próximas' : f === 'history' ? 'Histórico' : 'Todas'}
          </Button>
        ))}
        {data && (
          <span className="ml-auto text-xs text-slate-500">{data.meta.total} aula{data.meta.total !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <CalendarDays className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Nenhuma aula encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.data.map((cls, idx) => {
            const d = parseISO(cls.date);
            const dayAbbr = format(d, 'EEE', { locale: ptBR }).replace('.', '');
            const dayNum = format(d, 'dd');
            const month = format(d, 'MMM', { locale: ptBR }).replace('.', '');
            const isFirst = filter === 'upcoming' && idx === 0;

            return (
              <div
                key={cls.id}
                className="glass-panel rounded-2xl p-5 relative overflow-hidden flex items-center gap-6 group hover:border-primary/40 transition-all"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isFirst ? 'bg-primary' : 'bg-primary/30'}`} />

                <div className="text-center min-w-[60px]">
                  <p className={`text-xs font-bold uppercase ${isFirst ? 'text-primary' : 'text-slate-400'}`}>
                    {dayAbbr}
                  </p>
                  <p className="text-xl font-bold">{dayNum}</p>
                  <p className="text-xs text-slate-500 capitalize">{month}</p>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Badge variant={STATUS_VARIANT[cls.status] ?? 'default'} size="sm">
                      {STATUS_LABEL[cls.status] ?? cls.status}
                    </Badge>
                    <span className="text-slate-500 text-xs">
                      {formatTime(cls.startTime)} – {formatTime(cls.endTime)}
                    </span>
                  </div>
                  {cls.content ? (
                    <p className="font-semibold text-sm truncate">{cls.content}</p>
                  ) : (
                    <p className="text-sm text-slate-500 italic">Sem conteúdo definido</p>
                  )}
                  {cls.homework && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      <span className="text-slate-300 font-medium">Tarefa: </span>{cls.homework}
                    </p>
                  )}
                </div>

                <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-primary transition-colors shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
