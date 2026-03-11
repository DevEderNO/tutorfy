import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { GraduationCap, CalendarDays, CheckCircle2, BookOpen, ClipboardList } from "lucide-react";

interface PortalClass {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  content: string | null;
  homework: string | null;
}

interface PortalData {
  student: { name: string; grade: string; school: string };
  upcoming: PortalClass[];
  history: PortalClass[];
}

async function fetchPortal(token: string): Promise<PortalData> {
  const res = await fetch(`/api/public/students/${token}`);
  if (!res.ok) throw new Error("not_found");
  return res.json();
}

export function StudentPortalPage() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["portal", token],
    queryFn: () => fetchPortal(token!),
    enabled: !!token,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0c0816]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0c0816] px-4">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Página não encontrada</h1>
          <p className="text-slate-400 text-sm">
            Este link é inválido ou o aluno não existe.
          </p>
        </div>
      </div>
    );
  }

  const { student, upcoming, history } = data;

  return (
    <div className="min-h-screen bg-[#0c0816] text-slate-100 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Tutorfy</span>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/10">
          <h1 className="text-2xl font-black text-white">{student.name}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {student.grade} · {student.school}
          </p>
        </div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-3">
              <CalendarDays className="h-4 w-4" />
              Próximas Aulas
            </h2>
            <div className="space-y-3">
              {upcoming.map((cls) => (
                <div
                  key={cls.id}
                  className="glass p-4 rounded-xl border border-blue-500/20 flex items-center gap-4"
                >
                  <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <CalendarDays className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white capitalize">
                      {format(parseISO(cls.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {cls.startTime} – {cls.endTime}
                    </p>
                    {cls.content && (
                      <p className="text-xs text-slate-300 mt-1 italic">{cls.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* History */}
        {history.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3">
              <CheckCircle2 className="h-4 w-4" />
              Histórico de Aulas
            </h2>
            <div className="space-y-4">
              {history.map((cls) => (
                <div
                  key={cls.id}
                  className="glass p-4 rounded-xl border border-emerald-500/20"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <p className="text-sm font-bold text-white capitalize">
                      {format(parseISO(cls.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    <span className="text-xs text-slate-500 ml-auto">
                      {cls.startTime} – {cls.endTime}
                    </span>
                  </div>

                  {cls.content && (
                    <div className="flex gap-2 mb-2">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-200">{cls.content}</p>
                    </div>
                  )}

                  {cls.homework && (
                    <div className="flex gap-2 mt-2 p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                      <ClipboardList className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                          Tarefa
                        </p>
                        <p className="text-sm text-slate-200">{cls.homework}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {upcoming.length === 0 && history.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nenhuma aula registrada ainda.</p>
          </div>
        )}

        <p className="text-center text-xs text-slate-600 pt-4">
          Powered by Tutorfy
        </p>
      </div>
    </div>
  );
}
