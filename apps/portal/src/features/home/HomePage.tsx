import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BookOpen,
  CalendarClock,
  TrendingUp,
  ChevronRight,
  ArrowRight,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import { usePortalAuth } from '@/lib/auth';
import { Badge } from '@tutorfy/ui';

interface Student {
  id: string;
  name: string;
  avatarUrl: string | null;
  grade: string | null;
  school: string | null;
  currentLevel: string | null;
  active: boolean;
}

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
  const firstName = account?.name.split(' ')[0];
  const today = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });

  // Students
  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['portal', 'students'],
    queryFn: async () => {
      const res = await api.get<{ data: Student[] }>('/portal/students');
      return res.data.data;
    },
  });

  const primaryStudent = students?.[0];

  // Upcoming classes (student view — first student)
  const { data: upcomingData } = useQuery({
    queryKey: ['portal', 'classes', primaryStudent?.id, 'upcoming'],
    enabled: !!primaryStudent,
    queryFn: async () => {
      const res = await api.get<{ data: ClassSession[]; meta: { total: number } }>(
        `/portal/students/${primaryStudent!.id}/classes?filter=upcoming&page=1&limit=3`,
      );
      return res.data;
    },
  });

  // Total completed classes
  const { data: historyData } = useQuery({
    queryKey: ['portal', 'classes', primaryStudent?.id, 'history'],
    enabled: !!primaryStudent,
    queryFn: async () => {
      const res = await api.get<{ data: ClassSession[]; meta: { total: number } }>(
        `/portal/students/${primaryStudent!.id}/classes?filter=history&page=1&limit=1`,
      );
      return res.data;
    },
  });

  // Recent evolution
  const { data: evolutionData } = useQuery({
    queryKey: ['portal', 'evolution', primaryStudent?.id],
    enabled: !!primaryStudent,
    queryFn: async () => {
      const res = await api.get<{ data: EvolutionEntry[]; meta: { total: number } }>(
        `/portal/students/${primaryStudent!.id}/evolution?page=1&limit=2`,
      );
      return res.data;
    },
  });

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
      {!isGuardian && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Aulas realizadas */}
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

          {/* Próxima aula */}
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

          {/* Evolução */}
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
      )}

      {/* ── Two-column: Classes + Evolution (student view) ── */}
      {!isGuardian && (
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
              {primaryStudent && (
                <button
                  onClick={() => navigate(`/students/${primaryStudent.id}`)}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Ver todas
                </button>
              )}
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
                      onClick={() => primaryStudent && navigate(`/students/${primaryStudent.id}`)}
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
      )}

      {/* ── Alunos vinculados (guardian + student com múltiplos) ── */}
      {(isGuardian || (students && students.length > 0)) && (
        <section className="space-y-4 pb-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {isGuardian ? 'Alunos vinculados' : 'Meu aluno'}
          </h2>

          {loadingStudents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="glass-panel rounded-2xl h-28 animate-pulse" />
              ))}
            </div>
          ) : !students?.length ? (
            <div className="glass-panel rounded-2xl p-8 text-center">
              <p className="text-sm text-slate-500">Nenhum aluno vinculado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="glass-panel rounded-2xl p-6 flex items-center gap-5 hover:border-primary/50 transition-all group cursor-pointer"
                  onClick={() => navigate(`/students/${student.id}`)}
                >
                  <div className="relative shrink-0">
                    <div className="h-16 w-16 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center">
                      {student.avatarUrl ? (
                        <img src={student.avatarUrl} alt={student.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-primary font-bold text-2xl">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {student.active && (
                      <div className="absolute bottom-0 right-0 h-4 w-4 bg-emerald-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-lg truncate">{student.name}</h4>
                      <Badge variant={student.active ? 'success' : 'default'} size="sm">
                        {student.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 truncate">
                      {[student.grade, student.school].filter(Boolean).join(' • ') || 'Sem informações'}
                    </p>
                  </div>
                  <button
                    aria-label={`Ver detalhes de ${student.name}`}
                    className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-lg shadow-black/20 shrink-0"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
