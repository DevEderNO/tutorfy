import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, GraduationCap, School, Users, UserCheck, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

interface Student {
  id: string;
  name: string;
  avatarUrl: string | null;
  grade: string | null;
  school: string | null;
  currentLevel: string | null;
  active: boolean;
}

export function StudentsListPage() {
  const navigate = useNavigate();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['portal', 'students'],
    queryFn: async () => {
      const res = await api.get<{ data: Student[] }>('/portal/students');
      return res.data.data;
    },
  });

  const activeCount = students.filter((s) => s.active).length;
  const withLevelCount = students.filter((s) => s.currentLevel).length;

  return (
    <div className="space-y-8">

      {/* Stat cards */}
      {!isLoading && students.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{students.length}</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total de alunos</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <UserCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{activeCount}</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ativos</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{withLevelCount}</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Com avaliação</p>
            </div>
          </div>
        </div>
      )}

      {/* Section heading */}
      {!isLoading && students.length > 0 && (
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Seus alunos</h2>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
            {students.length}
          </span>
        </div>
      )}

      {/* Student cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : !students.length ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-primary/50" />
          </div>
          <p className="font-semibold text-foreground">Nenhum aluno vinculado</p>
          <p className="text-sm text-muted-foreground mt-1">Solicite ao tutor o link de acesso para acompanhar os alunos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <button
              key={student.id}
              onClick={() => navigate(`/students/${student.id}`)}
              className="glass rounded-2xl p-5 text-left flex flex-col gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group"
            >
              {/* Avatar + status */}
              <div className="flex items-start justify-between">
                <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
                  {student.avatarUrl ? (
                    <img src={student.avatarUrl} alt={student.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-primary font-black text-xl">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  student.active
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${student.active ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  {student.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-1.5">
                <p className="font-bold text-foreground text-base leading-tight">{student.name}</p>

                {student.grade && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{student.grade}</span>
                  </div>
                )}

                {student.school && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <School className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{student.school}</span>
                  </div>
                )}

                {student.currentLevel && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <Sparkles className="h-3 w-3 text-violet-400 shrink-0" />
                    <span className="text-[11px] font-semibold text-violet-300 truncate">{student.currentLevel}</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-xs font-semibold text-primary">Ver detalhes</span>
                <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
