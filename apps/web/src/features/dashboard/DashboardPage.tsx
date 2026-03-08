import { useDashboard } from "./hooks/useDashboard";
import { usePayments } from "../payments/hooks/usePayments";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Search,
  Bell,
  Plus,
  MoreVertical,
  CircleDollarSign,
  Users,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const statusConfig: Record<
  string,
  { dot: string; text: string; bg: string; label: string }
> = {
  SCHEDULED: {
    dot: "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]",
    text: "text-blue-500",
    bg: "bg-blue-500/10",
    label: "Agendada",
  },
  COMPLETED: {
    dot: "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]",
    text: "text-emerald-500",
    bg: "bg-emerald-500/10",
    label: "Concluída",
  },
  CANCELED: {
    dot: "bg-slate-500 shadow-[0_0_15px_rgba(100,116,139,0.4)]",
    text: "text-slate-400",
    bg: "bg-slate-500/10",
    label: "Cancelada",
  },
  MISSED: {
    dot: "bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]",
    text: "text-orange-500",
    bg: "bg-orange-500/10",
    label: "Falta",
  },
};

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading: isDashboardLoading } = useDashboard();
  const [activeFilter, setActiveFilter] = useState("SCHEDULED");

  const now = new Date();
  const { data: payments, isLoading: isPaymentsLoading } = usePayments({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  if (isDashboardLoading || isPaymentsLoading) {
    return (
      <div className="flex h-[calc(100vh-3rem)] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) =>
    addDays(weekStart, i),
  );

  // For the actual filtered classes in UI, currently filtering by activeFilter
  const filteredClasses =
    data?.weekClasses?.filter((c) => c.status === activeFilter) || [];

  const paidCount = payments?.filter((p) => p.paid).length ?? 0;
  const pendingCount = payments?.filter((p) => !p.paid).length ?? 0;
  const totalCount = payments?.length || 0;
  const totalReceived =
    payments?.filter((p) => p.paid).reduce((sum, p) => sum + p.amount, 0) ?? 0;

  const inadimplenciaRate =
    totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0;

  const recentPayments = payments?.filter((p) => p.paid).slice(0, 4) || [];

  return (
    <div className="flex flex-col min-h-screen text-slate-100 pb-10">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-primary/10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h2 className="text-xl font-bold tracking-tight">Visão Geral</h2>
          <div className="relative w-72 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              className="w-full bg-slate-800/50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 text-slate-200 placeholder:text-slate-500 transition-all outline-none"
              placeholder="Buscar alunos ou aulas..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            aria-label="Notificações"
            className="glass p-2.5 rounded-xl text-slate-400 hover:text-white relative transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full neon-glow"></span>
          </button>
          <Link
            to="/schedule"
            className="gradient-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Nova Aula</span>
          </Link>
          <div className="hidden sm:block h-8 w-[1px] bg-slate-700/50 mx-2"></div>
          <div className="hidden sm:flex h-10 w-10 rounded-xl glass p-0.5 overflow-hidden border border-primary/20 justify-center items-center bg-primary/10 text-primary font-bold">
            {user?.avatarUrl ? (
              <img
                className="w-full h-full object-cover rounded-lg"
                src={user.avatarUrl}
                alt="Avatar"
              />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8 flex-1">
        {/* KPI Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-xl space-y-4 hover:border-primary/30 transition-colors">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
                <CircleDollarSign className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-emerald-500 uppercase">
                {totalCount > 0 ? "Real" : "Pendente"}
              </span>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">
                Receita Recebida
              </p>
              <h3 className="text-3xl font-bold mt-1 tracking-tight">
                R$ {totalReceived.toFixed(2)}
              </h3>
            </div>
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all"
                style={{
                  width: `${
                    totalCount > 0
                      ? Math.round((paidCount / totalCount) * 100)
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div className="glass p-6 rounded-xl space-y-4 hover:border-primary/30 transition-colors">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-primary uppercase">
                Ativos
              </span>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Alunos</p>
              <h3 className="text-3xl font-bold mt-1 tracking-tight">
                {data?.activeStudents || 0}
              </h3>
            </div>
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[100%] rounded-full shadow-[0_0_8px_rgba(137,90,246,0.4)]"></div>
            </div>
          </div>

          <div className="glass p-6 rounded-xl space-y-4 hover:border-primary/30 transition-colors">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-orange-500/10 rounded-lg text-orange-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-orange-500 uppercase">
                Mensal
              </span>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">
                Inadimplência
              </p>
              <h3 className="text-3xl font-bold mt-1 tracking-tight">
                {inadimplenciaRate}%
              </h3>
            </div>
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-orange-500 h-full rounded-full shadow-[0_0_8px_rgba(249,115,22,0.4)] transition-all"
                style={{ width: `${inadimplenciaRate}%` }}
              ></div>
            </div>
          </div>
        </section>

        {/* Agenda Semanal */}
        <section className="glass p-8 rounded-xl overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h2 className="text-lg font-bold">Agenda Semanal</h2>

            {/* Filter Tabs matching Stitch's subtle glass look */}
            <div className="flex items-center bg-slate-800/50 p-1 rounded-xl overflow-x-auto hide-scrollbar border border-slate-700/30">
              {Object.entries(statusConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`px-4 py-1.5 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${
                    activeFilter === key
                      ? "bg-slate-700/80 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex gap-2">
              <button
                aria-label="Semana anterior"
                className="glass h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-slate-300" />
              </button>
              <button
                aria-label="Próxima semana"
                className="glass h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-slate-300" />
              </button>
            </div>
          </div>

          <div className="flex justify-between mb-8 overflow-x-auto pb-4 gap-2">
            {weekDays.map((day) => {
              const isActive = isSameDay(day, today);
              return (
                <div
                  key={day.toISOString()}
                  className="flex flex-col items-center gap-3 min-w-[60px]"
                >
                  <span
                    className={`text-xs font-bold uppercase ${
                      isActive ? "text-primary" : "text-slate-500"
                    }`}
                  >
                    {format(day, "EEE", { locale: ptBR }).substring(0, 3)}
                  </span>
                  <div
                    className={`h-12 w-12 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? "bg-primary text-white neon-glow"
                        : "glass hover:bg-slate-800/80"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3 pr-2 max-h-[320px] overflow-y-auto custom-scrollbar">
            {filteredClasses.length > 0 ? (
              filteredClasses.map((cls) => {
                const config =
                  statusConfig[cls.status] || statusConfig.SCHEDULED;
                return (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-4 glass rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${config.dot}`}
                      ></div>
                      <div>
                        {/* Assuming class subject is missing in payload, using fallback */}
                        <h4 className="font-bold text-sm text-slate-100">
                          Aula Particular
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Aluno: {(cls as any).student?.name || "Desconhecido"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-8">
                      <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs font-medium">
                        <Clock className="h-4 w-4" />
                        {cls.startTime} - {cls.endTime}
                      </div>
                      <span
                        className={`px-3 py-1 ${config.bg} ${config.text} rounded-full text-[10px] font-bold uppercase tracking-wider`}
                      >
                        {config.label}
                      </span>
                      <button
                        aria-label="Opções da aula"
                        className="flex items-center justify-center p-1 rounded hover:bg-slate-800/50 transition-colors group-hover:text-primary"
                      >
                        <MoreVertical className="h-5 w-5 text-slate-500" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-500">
                Nenhuma aula {statusConfig[activeFilter]?.label.toLowerCase()}{" "}
                encontrada para esta semana.
              </div>
            )}
          </div>
        </section>

        {/* Bottom Layer */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Pagamentos Recentes
              </h3>
              <Link
                to="/financial"
                className="text-xs font-bold text-primary hover:text-white transition-colors uppercase tracking-wider"
              >
                Ver relatório
              </Link>
            </div>

            <div className="space-y-5">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => {
                  const stName =
                    (payment as any).student?.name || "Desconhecido";
                  const stInitial = getInitials(stName);

                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full border border-primary/20 bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {stInitial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-100 truncate">
                            {stName}
                          </p>
                          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                            Confirmado
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-500 whitespace-nowrap">
                        R$ {payment.amount.toFixed(2)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-center py-4 text-slate-500">
                  Nenhum pagamento liquidado no mês.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl gradient-primary p-8 flex flex-col justify-between relative overflow-hidden shadow-xl shadow-primary/20">
            <div className="relative z-10">
              <span className="px-2.5 py-1 bg-white/20 rounded shadow-sm text-[10px] font-extrabold text-white uppercase tracking-widest mb-4 inline-block backdrop-blur-md">
                Novidade v2.0
              </span>
              <h3 className="text-3xl font-black text-white leading-tight">
                Atualização da <br /> Plataforma
              </h3>
              <p className="text-white/80 text-sm mt-3 max-w-[280px] font-medium leading-relaxed">
                Novas ferramentas de análise de desempenho e integração visual
                via Stitch estão no ar!
              </p>
            </div>
            <div className="relative z-10 mt-8">
              <button className="bg-white text-primary px-6 py-2.5 rounded-lg font-bold text-sm shadow-xl hover:scale-[1.02] transition-all">
                Conhecer agora
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 h-64 w-64 bg-white/10 rounded-full blur-[40px]"></div>
            <div className="absolute right-4 top-4 opacity-20 scale-150 rotate-12 pointer-events-none">
              <Zap className="h-32 w-32 text-white" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
