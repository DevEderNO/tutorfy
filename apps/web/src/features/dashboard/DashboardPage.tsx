import { useDashboard } from "./hooks/useDashboard";
import { usePayments } from "../payments/hooks/usePayments";
import {
  useClasses,
  useUpdateClass,
  useDeleteClass,
} from "../classes/hooks/useClasses";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  addWeeks,
  parseISO,
} from "date-fns";
import { ClassStatus } from "@tutorfy/types";
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
  TrendingUp,
  CheckCircle2,
  XCircle,
  UserX,
  CalendarClock,
  Trash2,
  Pencil,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Modal } from "@/components/Modal";
import { ConfirmModal } from "@/components/ConfirmModal";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const statusConfig: Record<
  string,
  {
    dot: string;
    text: string;
    bg: string;
    border: string;
    avatarBg: string;
    label: string;
  }
> = {
  SCHEDULED: {
    dot: "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]",
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-l-blue-500",
    avatarBg: "bg-blue-500/15 text-blue-300",
    label: "Agendada",
  },
  COMPLETED: {
    dot: "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-l-emerald-500",
    avatarBg: "bg-emerald-500/15 text-emerald-300",
    label: "Concluída",
  },
  CANCELED: {
    dot: "bg-slate-500 shadow-[0_0_15px_rgba(100,116,139,0.4)]",
    text: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-l-slate-500",
    avatarBg: "bg-slate-500/15 text-slate-300",
    label: "Cancelada",
  },
  MISSED: {
    dot: "bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]",
    text: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-l-orange-500",
    avatarBg: "bg-orange-500/15 text-orange-300",
    label: "Falta",
  },
};

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading: isDashboardLoading } = useDashboard();
  const [activeFilter, setActiveFilter] = useState("SCHEDULED");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
  const [completingClass, setCompletingClass] = useState<{
    id: string;
    content: string;
    homework: string;
  } | null>(null);
  const [editingClass, setEditingClass] = useState<{
    id: string;
    studentId: string;
    date: string;
    startTime: string;
    endTime: string;
    content: string;
  } | null>(null);

  const { mutate: updateClass, isPending: isUpdating } = useUpdateClass();
  const { mutate: deleteClass } = useDeleteClass();

  const closeMenu = () => {
    setOpenMenuId(null);
    setMenuPos(null);
  };

  const handleMenuToggle = (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string,
  ) => {
    if (openMenuId === id) {
      closeMenu();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 192;
    const left =
      rect.right - menuWidth > 0 ? rect.right - menuWidth : rect.left;
    setMenuPos({ top: rect.bottom + 6, left });
    setOpenMenuId(id);
  };

  const handleStatusChange = (id: string, status: ClassStatus) => {
    if (status === ClassStatus.COMPLETED) {
      closeMenu();
      setCompletingClass({ id, content: "", homework: "" });
      return;
    }
    updateClass({ id, data: { status } });
    closeMenu();
  };

  const handleConfirmComplete = () => {
    if (!completingClass || !completingClass.content.trim()) return;
    updateClass({
      id: completingClass.id,
      data: {
        status: ClassStatus.COMPLETED,
        content: completingClass.content.trim(),
        homework: completingClass.homework.trim() || undefined,
      },
    });
    setCompletingClass(null);
  };

  const handleDelete = () => {
    if (!deletingClassId) return;
    deleteClass(deletingClassId);
    setDeletingClassId(null);
  };

  useEffect(() => {
    if (!openMenuId) return;
    const handleScroll = () => closeMenu();
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", closeMenu);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [openMenuId]);

  const now = new Date();
  const { data: payments, isLoading: isPaymentsLoading } = usePayments({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  const today = new Date();
  const weekStart = startOfWeek(addWeeks(today, weekOffset), {
    weekStartsOn: 1,
  });
  const weekEnd = addDays(weekStart, 6);
  const weekDays = Array.from({ length: 7 }).map((_, i) =>
    addDays(weekStart, i),
  );

  const { data: weekClasses, isLoading: isClassesLoading } = useClasses({
    startDate: format(weekStart, "yyyy-MM-dd"),
    endDate: format(weekEnd, "yyyy-MM-dd"),
  });

  if (isDashboardLoading || isPaymentsLoading) {
    return (
      <div className="flex h-[calc(100vh-3rem)] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const filteredClasses = (weekClasses ?? []).filter(
    (c) =>
      c.status === activeFilter && isSameDay(parseISO(c.date), selectedDay),
  );

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
      <Header
        title="Visão Geral"
        searchPlaceholder="Buscar alunos ou aulas..."
        onSearchChange={() => {}} // TODO: Implement search
        showCreateButton
        createButtonLink="/schedule"
        createButtonLabel="Nova Aula"
      />

      <div className="p-8 space-y-8 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* KPI Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 — Receita Recebida */}
          <div className="glass p-5 rounded-xl flex flex-col gap-3 hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/15 rounded-lg text-emerald-400">
                  <CircleDollarSign className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Receita Recebida
                </span>
              </div>
              <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {totalCount > 0 ? "Recebida" : "Pendente"}
              </span>
            </div>

            <h3 className="text-2xl font-bold tracking-tight tabular-nums text-white">
              {totalReceived.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </h3>

            <div className="space-y-1.5">
              <div className="w-full bg-slate-800/80 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full shadow-[0_0_6px_rgba(16,185,129,0.6)] transition-all duration-700"
                  style={{
                    width: `${totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0}%`,
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">
                  {paidCount} de {totalCount} pagamentos
                </span>
                <span className="text-emerald-400 font-bold">
                  {totalCount > 0
                    ? Math.round((paidCount / totalCount) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Card 2 — Total de Alunos */}
          <div className="glass p-5 rounded-xl flex flex-col gap-3 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/15 rounded-lg text-primary">
                  <Users className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Alunos
                </span>
              </div>
              <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                Ativos
              </span>
            </div>

            <div className="flex items-end gap-3">
              <h3 className="text-2xl font-bold tracking-tight tabular-nums text-white">
                {data?.activeStudents ?? 0}
              </h3>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mb-0.5">
                <TrendingUp className="h-3 w-3" />
                <span>+2 este mês</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <div className="flex -space-x-2">
                {Array.from({
                  length: Math.min(3, data?.activeStudents ?? 0),
                }).map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-[#0c0816] flex items-center justify-center text-[9px] font-bold text-white"
                    style={{
                      background: `hsl(${260 + i * 20}, 65%, ${50 + i * 5}%)`,
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              {(data?.activeStudents ?? 0) > 3 && (
                <span className="text-[11px] text-slate-500 ml-1">
                  +{(data?.activeStudents ?? 0) - 3} mais
                </span>
              )}
            </div>
          </div>

          {/* Card 3 — Inadimplência */}
          <div className="glass p-5 rounded-xl flex flex-col gap-3 hover:border-orange-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-500/15 rounded-lg text-orange-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Inadimplência
                </span>
              </div>
              <span className="text-[10px] font-bold tracking-widest text-orange-400 uppercase bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                Mensal
              </span>
            </div>

            <div className="flex items-end gap-3">
              <h3 className="text-2xl font-bold tracking-tight tabular-nums text-white">
                {inadimplenciaRate}%
              </h3>
              {inadimplenciaRate > 20 && (
                <span className="text-[11px] font-bold text-red-400 mb-0.5">
                  Crítico
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="w-full bg-slate-800/80 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full shadow-[0_0_6px_rgba(249,115,22,0.6)] transition-all duration-700"
                  style={{ width: `${inadimplenciaRate}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500">
                {pendingCount} pendentes de {totalCount}
              </span>
            </div>
          </div>
        </section>

        {/* Agenda Semanal */}
        <section className="glass p-8 rounded-xl overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold">Agenda Semanal</h2>
              <p className="text-sm text-slate-400 mt-0.5 capitalize">
                {format(weekStart, "MMMM yyyy", { locale: ptBR })}
                {format(weekStart, "MM") !== format(weekEnd, "MM") &&
                  ` — ${format(weekEnd, "MMMM", { locale: ptBR })}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter Tabs */}
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

              {/* Week navigation */}
              <div className="flex gap-1.5">
                <button
                  aria-label="Semana anterior"
                  onClick={() => {
                    setWeekOffset((o) => o - 1);
                    setSelectedDay((d) => addWeeks(d, -1));
                  }}
                  className="glass h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-700 hover:text-primary transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-slate-300" />
                </button>
                {weekOffset !== 0 && (
                  <button
                    onClick={() => {
                      setWeekOffset(0);
                      setSelectedDay(today);
                    }}
                    className="glass h-8 px-2 rounded-lg text-[10px] font-bold text-primary hover:bg-slate-700 transition-colors"
                  >
                    Hoje
                  </button>
                )}
                <button
                  aria-label="Próxima semana"
                  onClick={() => {
                    setWeekOffset((o) => o + 1);
                    setSelectedDay((d) => addWeeks(d, 1));
                  }}
                  className="glass h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-700 hover:text-primary transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Day picker */}
          <div className="flex justify-between mb-6 overflow-x-auto pb-2 gap-2">
            {weekDays.map((day) => {
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selectedDay);
              const dayClasses = (weekClasses ?? []).filter((c) =>
                isSameDay(parseISO(c.date), day),
              );
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className="flex flex-col items-center gap-2 min-w-[52px] group"
                >
                  <span
                    className={`text-[11px] font-bold uppercase transition-colors ${
                      isSelected
                        ? "text-primary"
                        : isToday
                          ? "text-slate-300"
                          : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  >
                    {format(day, "EEE", { locale: ptBR }).substring(0, 3)}
                  </span>
                  <div
                    className={`h-10 w-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                      isSelected
                        ? "bg-primary text-white neon-glow scale-105"
                        : isToday
                          ? "glass border border-primary/40 text-primary"
                          : "glass hover:bg-slate-800/80 text-slate-300"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                  {/* dot indicator for days with classes */}
                  <div
                    className={`h-1 w-1 rounded-full transition-all ${
                      dayClasses.length > 0
                        ? isSelected
                          ? "bg-primary"
                          : "bg-slate-500"
                        : "bg-transparent"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Classes list */}
          <div className="max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
            {isClassesLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : filteredClasses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredClasses.map((cls) => {
                  const config =
                    statusConfig[cls.status] || statusConfig.SCHEDULED;
                  const isMenuOpen = openMenuId === cls.id;
                  const studentName =
                    (cls as any).student?.name || "Desconhecido";

                  return (
                    <div
                      key={cls.id}
                      className={`flex flex-col gap-3 p-4 glass rounded-xl border-l-[3px] hover:brightness-105 transition-all ${config.border}`}
                    >
                      {/* Header: avatar + info + menu */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${config.avatarBg}`}
                        >
                          {getInitials(studentName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-white leading-tight truncate">
                            Aula Particular
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {studentName}
                          </p>
                        </div>
                        <button
                          aria-label="Opções da aula"
                          onClick={(e) => handleMenuToggle(e, cls.id)}
                          className={`shrink-0 p-1 rounded-md transition-colors ${
                            isMenuOpen
                              ? "bg-primary/10 text-primary"
                              : "text-slate-600 hover:text-slate-300 hover:bg-slate-800/60"
                          }`}
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Footer: time + badge */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span className="tabular-nums">
                            {cls.startTime} - {cls.endTime}
                          </span>
                        </div>
                        <span
                          className={`shrink-0 px-2 py-0.5 ${config.bg} ${config.text} rounded-full text-[10px] font-bold uppercase tracking-wider`}
                        >
                          {config.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                Nenhuma aula {statusConfig[activeFilter]?.label.toLowerCase()}{" "}
                em {format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}.
              </div>
            )}
          </div>

          {/* Context menu portal */}
          {openMenuId &&
            menuPos &&
            ReactDOM.createPortal(
              <>
                <div className="fixed inset-0 z-[998]" onClick={closeMenu} />
                <div
                  className="fixed z-[999] w-48 rounded-md border border-slate-700/70 bg-[#120e1e] shadow-lg shadow-black/50 py-1 animate-in fade-in-0 zoom-in-95 duration-100"
                  style={{ top: menuPos.top, left: menuPos.left }}
                >
                  {(() => {
                    const cls = filteredClasses.find(
                      (c) => c.id === openMenuId,
                    )!;
                    if (!cls) return null;
                    const statusActions: {
                      status: ClassStatus;
                      label: string;
                      icon: React.ReactNode;
                    }[] = [
                      {
                        status: ClassStatus.COMPLETED,
                        label: "Concluir",
                        icon: (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ),
                      },
                      {
                        status: ClassStatus.MISSED,
                        label: "Falta",
                        icon: <UserX className="h-4 w-4 text-orange-400" />,
                      },
                      {
                        status: ClassStatus.CANCELED,
                        label: "Cancelar",
                        icon: <XCircle className="h-4 w-4 text-slate-400" />,
                      },
                      {
                        status: ClassStatus.SCHEDULED,
                        label: "Reagendar",
                        icon: (
                          <CalendarClock className="h-4 w-4 text-primary" />
                        ),
                      },
                    ].filter((a) => a.status !== cls.status);

                    return (
                      <>
                        <button
                          onClick={() => {
                            setEditingClass({
                              id: cls.id,
                              studentId: cls.studentId,
                              date: format(parseISO(cls.date), "yyyy-MM-dd"),
                              startTime: cls.startTime,
                              endTime: cls.endTime,
                              content: cls.content ?? "",
                            });
                            closeMenu();
                          }}
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800/80 transition-colors"
                        >
                          <Pencil className="h-4 w-4 text-primary" />
                          Editar Aula
                        </button>
                        <div className="h-px bg-slate-700/50 my-1" />
                        {statusActions.map((action) => (
                          <button
                            key={action.status}
                            onClick={() =>
                              handleStatusChange(cls.id, action.status)
                            }
                            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800/80 transition-colors"
                          >
                            {action.icon}
                            {action.label}
                          </button>
                        ))}
                        <div className="h-px bg-slate-700/50 my-1" />
                        <button
                          onClick={() => {
                            setDeletingClassId(cls.id);
                            closeMenu();
                          }}
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir Aula
                        </button>
                      </>
                    );
                  })()}
                </div>
              </>,
              document.body,
            )}
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

      {/* Edit Class Modal */}
      <Modal
        isOpen={!!editingClass}
        onClose={() => setEditingClass(null)}
        title="Editar Aula"
      >
        {editingClass && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                Data
              </label>
              <input
                type="date"
                value={editingClass.date}
                onChange={(e) =>
                  setEditingClass({ ...editingClass, date: e.target.value })
                }
                aria-label="Data da aula"
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-slate-200 transition-all font-medium outline-none [color-scheme:dark]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                  Início
                </label>
                <input
                  type="time"
                  value={editingClass.startTime}
                  onChange={(e) =>
                    setEditingClass({ ...editingClass, startTime: e.target.value })
                  }
                  aria-label="Horário de início"
                  className="w-full glass-input rounded-xl px-3 py-3 text-sm text-slate-200 transition-all font-medium outline-none [color-scheme:dark]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                  Fim
                </label>
                <input
                  type="time"
                  value={editingClass.endTime}
                  onChange={(e) =>
                    setEditingClass({ ...editingClass, endTime: e.target.value })
                  }
                  aria-label="Horário de fim"
                  className="w-full glass-input rounded-xl px-3 py-3 text-sm text-slate-200 transition-all font-medium outline-none [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                Plano da Aula
              </label>
              <textarea
                value={editingClass.content}
                onChange={(e) =>
                  setEditingClass({ ...editingClass, content: e.target.value })
                }
                placeholder="O que será trabalhado nesta aula..."
                rows={2}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-slate-200 transition-all font-medium outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => setEditingClass(null)}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-slate-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!editingClass.date || !editingClass.startTime || !editingClass.endTime)
                    return;
                  updateClass({
                    id: editingClass.id,
                    data: {
                      date: editingClass.date,
                      startTime: editingClass.startTime,
                      endTime: editingClass.endTime,
                      content: editingClass.content || undefined,
                    },
                  });
                  setEditingClass(null);
                }}
                disabled={
                  !editingClass.date ||
                  !editingClass.startTime ||
                  !editingClass.endTime ||
                  isUpdating
                }
                className="w-full bg-primary py-3.5 rounded-xl text-white font-bold text-sm neon-glow hover:brightness-110 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                {isUpdating ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Complete Class Modal */}
      <Modal
        isOpen={!!completingClass}
        onClose={() => setCompletingClass(null)}
        title="Registrar Aula Concluída"
      >
        {completingClass && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                O que foi feito *
              </label>
              <textarea
                value={completingClass.content}
                onChange={(e) =>
                  setCompletingClass({ ...completingClass, content: e.target.value })
                }
                placeholder="Descreva o conteúdo trabalhado na aula..."
                rows={3}
                autoFocus
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-slate-200 transition-all font-medium outline-none resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                Tarefa para próxima aula
              </label>
              <textarea
                value={completingClass.homework}
                onChange={(e) =>
                  setCompletingClass({ ...completingClass, homework: e.target.value })
                }
                placeholder="Ex: Exercícios pág. 34-36..."
                rows={2}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-slate-200 transition-all font-medium outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => setCompletingClass(null)}
                className="w-full py-3 rounded-xl font-bold text-sm text-slate-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmComplete}
                disabled={!completingClass.content.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50 disabled:pointer-events-none transition-all"
              >
                Concluir e Notificar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Class Modal */}
      <ConfirmModal
        isOpen={!!deletingClassId}
        onClose={() => setDeletingClassId(null)}
        onConfirm={handleDelete}
        title="Excluir Aula"
        description="Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita."
        confirmLabel="Sim, Excluir"
        cancelLabel="Cancelar"
        icon={Trash2}
        variant="danger"
      />
    </div>
  );
}
