import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BookOpen,
  CalendarClock,
  TrendingUp,
  ChevronRight,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import { usePortalAuth } from '@/lib/auth';
import { useSelectedStudent } from '@/lib/selected-student';
import { Badge } from '@tutorfy/ui';

interface ClassSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED' | 'MISSED';
  content: string | null;
}

interface EvolutionEntry {
  id: string;
  description: string;
  createdAt: string;
  categories: { category: { id: string; name: string; color: string } }[];
}

function formatTime(iso: string) {
  return format(parseISO(iso), 'HH:mm');
}

function formatNextClassLabel(dateIso: string) {
  const d = parseISO(dateIso);
  if (isToday(d)) return 'Hoje';
  if (isTomorrow(d)) return 'Amanhã';
  return format(d, "EEE, dd MMM", { locale: ptBR });
}

export function HomePage() {
  const { account, isGuardian } = usePortalAuth();
  const navigate = useNavigate();
  const { selectedId, selectedStudent, isLoading: studentsLoading } = useSelectedStudent();
  const firstName = account?.name.split(' ')[0];
  const today = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });

  const { data: upcomingData } = useQuery({
    queryKey: ['portal', 'classes', selectedId, 'upcoming'],
    enabled: !!selectedId,
    queryFn: async () => {
      const res = await api.get<{ data: ClassSession[]; meta: { total: number } }>(
        `/portal/students/${selectedId}/classes?filter=upcoming&page=1&limit=3`,
      );
      return res.data;
    },
  });

  const { data: historyData } = useQuery({
    queryKey: ['portal', 'classes', selectedId, 'history'],
    enabled: !!selectedId,
    queryFn: async () => {
      const res = await api.get<{ data: ClassSession[]; meta: { total: number } }>(
        `/portal/students/${selectedId}/classes?filter=history&page=1&limit=1`,
      );
      return res.data;
    },
  });

  const { data: evolutionData } = useQuery({
    queryKey: ['portal', 'evolution', selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const res = await api.get<{ data: EvolutionEntry[]; meta: { total: number } }>(
        `/portal/students/${selectedId}/evolution?page=1&limit=2`,
      );
      return res.data;
    },
  });

  if (studentsLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="h-12 w-64 glass-panel rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const upcomingClasses = upcomingData?.data ?? [];
  const nextClass = upcomingClasses[0];
  const totalCompleted = historyData?.meta.total ?? 0;
  const totalEvolution = evolutionData?.meta.total ?? 0;
  const evolutionEntries = evolutionData?.data ?? [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* ── Hero ── */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Olá, {firstName}!</h1>
          <p className="text-slate-400 text-lg">
            {isGuardian ? 'Acompanhe a evolução dos seus filhos' : 'Acompanhe sua evolução e próximas aulas'}
          </p>
        </div>
        <div className="glass-pill px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium text-slate-300 border border-primary/20 bg-primary/10 backdrop-blur-sm w-fit">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span className="capitalize">{today}</span>
        </div>
      </section>

      {/* ── Stats Row ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 glow-accent">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
              concluídas
            </span>
          </div>
          <p className="text-slate-400 text-sm font-medium">Aulas realizadas</p>
          <h3 className="text-3xl font-bold mt-1">{totalCompleted}</h3>
        </div>

        <div className="glass-panel rounded-2xl p-6 glow-accent">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <CalendarClock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium">Próxima aula</p>
          {nextClass ? (
            <>
              <h3 className="text-3xl font-bold mt-1">{formatNextClassLabel(nextClass.date)}</h3>
              <p className="text-slate-500 text-xs mt-1">
                {formatTime(nextClass.startTime)} – {formatTime(nextClass.endTime)}
              </p>
            </>
          ) : (
            <h3 className="text-xl font-bold mt-1 text-slate-500">Nenhuma</h3>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-6 glow-accent">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium">Entradas de evolução</p>
          <h3 className="text-3xl font-bold mt-1">{totalEvolution}</h3>
          <p className="text-slate-500 text-xs mt-1">total</p>
        </div>
      </section>

      {/* ── Two-column: Classes + Evolution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">

        {/* Próximas aulas */}
        <section className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Próximas aulas
              {upcomingClasses.length > 0 && (
                <Badge variant="primary" size="sm">{upcomingClasses.length}</Badge>
              )}
            </h2>
            <button
              onClick={() => navigate('/classes')}
              className="text-primary text-sm font-medium hover:underline"
            >
              Ver todas
            </button>
          </div>

          {upcomingClasses.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center">
              <CalendarClock className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Nenhuma aula agendada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingClasses.map((cls, idx) => {
                const d = parseISO(cls.date);
                const dayAbbr = format(d, 'EEE', { locale: ptBR }).replace('.', '');
                const dayNum = format(d, 'dd');
                const month = format(d, 'MMM', { locale: ptBR }).replace('.', '');
                const isFirst = idx === 0;
                return (
                  <div
                    key={cls.id}
                    className="glass-panel rounded-2xl p-5 relative overflow-hidden flex items-center gap-6 group hover:border-primary/40 transition-all cursor-pointer"
                    onClick={() => navigate('/classes')}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isFirst ? 'bg-primary' : 'bg-primary/40'}`} />
                    <div className="text-center min-w-[60px]">
                      <p className={`text-xs font-bold uppercase ${isFirst ? 'text-primary' : 'text-slate-400'}`}>
                        {dayAbbr}
                      </p>
                      <p className="text-xl font-bold">{dayNum}</p>
                      <p className="text-xs text-slate-500 capitalize">{month}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/20">
                          Agendada
                        </span>
                        <span className="text-slate-500 text-xs">
                          {formatTime(cls.startTime)} – {formatTime(cls.endTime)}
                        </span>
                      </div>
                      <p className="font-bold text-base truncate">{cls.content || 'Aula sem conteúdo definido'}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-primary transition-colors shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Evolução recente */}
        <section className="lg:col-span-4 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Evolução recente
          </h2>

          {evolutionEntries.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center">
              <TrendingUp className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Nenhuma entrada registrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {evolutionEntries.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`glass-panel rounded-2xl p-5 border-l-4 ${idx === 0 ? 'border-l-emerald-500' : 'border-l-primary'}`}
                >
                  <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
                    <p className="text-xs font-medium text-slate-500">
                      {format(parseISO(entry.createdAt), "dd MMM yyyy", { locale: ptBR })}
                    </p>
                    {entry.categories.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {entry.categories.slice(0, 2).map(({ category }) => (
                          <span
                            key={category.id}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic line-clamp-3">
                    "{entry.description}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Aluno vinculado (guardian com 1 aluno) ── */}
      {isGuardian && selectedStudent && (
        <section className="space-y-4 pb-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Aluno vinculado
          </h2>
          <div className="glass-panel rounded-2xl p-6 flex items-center gap-5 w-full md:w-auto md:max-w-sm">
            <div className="h-14 w-14 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
              {selectedStudent.avatarUrl ? (
                <img src={selectedStudent.avatarUrl} alt={selectedStudent.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-primary font-bold text-xl">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-lg truncate">{selectedStudent.name}</h4>
                <Badge variant={selectedStudent.active ? 'success' : 'default'} size="sm">
                  {selectedStudent.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <p className="text-sm text-slate-400 truncate">
                {[selectedStudent.grade, selectedStudent.school].filter(Boolean).join(' • ') || 'Sem informações'}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
