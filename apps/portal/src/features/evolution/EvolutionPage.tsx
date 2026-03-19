import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Sparkles, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { usePortalAuth } from '@/lib/auth';
import { Button, Pagination } from '@tutorfy/ui';

interface Student {
  id: string;
  name: string;
}

interface EvolutionEntry {
  id: string;
  description: string;
  createdAt: string;
  classSession: { date: string; startTime: string; endTime: string } | null;
  categories: { category: { id: string; name: string; color: string } }[];
}

const BORDER_COLORS = [
  'border-l-emerald-500',
  'border-l-primary',
  'border-l-orange-400',
  'border-l-violet-500',
  'border-l-pink-500',
];

export function EvolutionPage() {
  const { isGuardian } = usePortalAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data: students } = useQuery({
    queryKey: ['portal', 'students'],
    queryFn: async () => {
      const res = await api.get<{ data: Student[] }>('/portal/students');
      return res.data.data;
    },
  });

  const primaryStudent = students?.[0];

  const { data, isLoading } = useQuery({
    queryKey: ['portal', 'evolution', primaryStudent?.id, page],
    enabled: !!primaryStudent,
    queryFn: async () => {
      const res = await api.get<{ data: EvolutionEntry[]; meta: { total: number; totalPages: number } }>(
        `/portal/students/${primaryStudent!.id}/evolution?page=${page}&limit=10`,
      );
      return res.data;
    },
  });

  if (isGuardian) {
    return (
      <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center gap-6 py-24">
        <div className="glass-panel rounded-2xl p-10 text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-white">Selecione um aluno</h2>
          <p className="text-slate-400 text-sm">
            Acesse o perfil de um aluno vinculado para ver o registro de evolução.
          </p>
          <Button variant="primary" onClick={() => navigate('/students')}>
            Ver alunos vinculados
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">

      {data && (
        <p className="text-xs text-slate-500">{data.meta.total} entrada{data.meta.total !== 1 ? 's' : ''} registrada{data.meta.total !== 1 ? 's' : ''}</p>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Sparkles className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Nenhuma entrada de evolução registrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.data.map((entry, idx) => (
            <div
              key={entry.id}
              className={`glass-panel rounded-2xl p-6 border-l-4 ${BORDER_COLORS[idx % BORDER_COLORS.length]}`}
            >
              <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {format(parseISO(entry.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  {entry.classSession && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Aula de {format(parseISO(entry.classSession.date), 'dd/MM/yyyy')}
                    </p>
                  )}
                </div>
                {entry.categories.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {entry.categories.map(({ category }) => (
                      <span
                        key={category.id}
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${category.color}22`, color: category.color }}
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{entry.description}</p>
            </div>
          ))}
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
