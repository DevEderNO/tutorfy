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
  CircleDollarSign,
  Users,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  Zap,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Modal as UIModal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { ConfirmModal } from "@/components/ConfirmModal";
import React, { useState } from "react";
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
    status: string;
  } | null>(null);

  const [viewingClass, setViewingClass] = useState<{
    studentName: string;
    date: string;
    startTime: string;
    endTime: string;
    content: string;
    homework: string | null;
  } | null>(null);

  const { mutate: updateClass, isPending: isUpdating } = useUpdateClass();
  const { mutate: deleteClass } = useDeleteClass();


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
                  <Button
                    key={key}
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveFilter(key)}
                    className={`rounded-lg whitespace-nowrap font-bold ${
                      activeFilter === key
                        ? "bg-slate-700/80 text-white shadow-sm hover:bg-slate-700/80"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {config.label}
                  </Button>
                ))}
              </div>

              {/* Week navigation */}
              <div className="flex gap-1.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Semana anterior"
                  onClick={() => {
                    setWeekOffset((o) => o - 1);
                    setSelectedDay((d) => addWeeks(d, -1));
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {weekOffset !== 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setWeekOffset(0);
                      setSelectedDay(today);
                    }}
                    className="text-primary text-[10px] font-bold px-2"
                  >
                    Hoje
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Próxima semana"
                  onClick={() => {
                    setWeekOffset((o) => o + 1);
                    setSelectedDay((d) => addWeeks(d, 1));
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Day picker */}
          <Tabs
            value={selectedDay.toISOString()}
            onValueChange={(v) => setSelectedDay(new Date(v))}
            variant="underline"
            className="mb-6"
          >
            <TabsList className="w-full justify-between gap-0">
              {weekDays.map((day) => {
                const isToday = isSameDay(day, today);
                const dayClasses = (weekClasses ?? []).filter((c) =>
                  isSameDay(parseISO(c.date), day),
                );
                return (
                  <TabsTrigger
                    key={day.toISOString()}
                    value={day.toISOString()}
                    className="flex flex-col items-center gap-1 px-3 py-2 min-w-[52px]"
                  >
                    <span className="text-[11px] font-bold uppercase">
                      {format(day, "EEE", { locale: ptBR }).substring(0, 3)}
                    </span>
                    <span className={`text-sm font-bold ${isToday ? "text-primary" : ""}`}>
                      {format(day, "d")}
                    </span>
                    <div
                      className={`h-1 w-1 rounded-full transition-all ${
                        dayClasses.length > 0 ? "bg-current opacity-60" : "bg-transparent"
                      }`}
                    />
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

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
                  const studentName =
                    (cls as any).student?.name || "Desconhecido";

                  return (
                    <div
                      key={cls.id}
                      onClick={() => {
                        if (cls.status === ClassStatus.COMPLETED) {
                          setViewingClass({
                            studentName: (cls as any).student?.name ?? "Aluno(a)",
                            date: format(parseISO(cls.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
                            startTime: cls.startTime,
                            endTime: cls.endTime,
                            content: cls.content ?? "",
                            homework: cls.homework ?? null,
                          });
                        } else {
                          setEditingClass({
                            id: cls.id,
                            studentId: cls.studentId,
                            date: format(parseISO(cls.date), "yyyy-MM-dd"),
                            startTime: cls.startTime,
                            endTime: cls.endTime,
                            content: cls.content ?? "",
                            status: cls.status ?? "SCHEDULED",
                          });
                        }
                      }}
                      className={`flex flex-col gap-3 p-4 glass rounded-xl border-l-[3px] hover:brightness-105 transition-all cursor-pointer ${config.border}`}
                    >
                      {/* Header: avatar + info */}
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
              <Button className="bg-white text-primary hover:bg-white/90 shadow-xl hover:scale-[1.02]">
                Conhecer agora
              </Button>
            </div>
            <div className="absolute -right-10 -bottom-10 h-64 w-64 bg-white/10 rounded-full blur-[40px]"></div>
            <div className="absolute right-4 top-4 opacity-20 scale-150 rotate-12 pointer-events-none">
              <Zap className="h-32 w-32 text-white" />
            </div>
          </div>
        </section>
      </div>

      {/* View Completed Class Modal */}
      <UIModal open={!!viewingClass} onOpenChange={(open) => { if (!open) setViewingClass(null); }}>
        <ModalContent size="xl">
          <ModalHeader>
            <ModalTitle>Aula Concluída</ModalTitle>
          </ModalHeader>
          {viewingClass && (
            <ModalBody>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-400 mb-4">
                <span><span className="font-semibold text-slate-200">Aluno:</span> {viewingClass.studentName}</span>
                <span><span className="font-semibold text-slate-200">Data:</span> {viewingClass.date}</span>
                <span><span className="font-semibold text-slate-200">Horário:</span> {viewingClass.startTime} – {viewingClass.endTime}</span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">O que foi feito</label>
                <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap min-h-[80px]">
                  {viewingClass.content || <span className="text-slate-500 italic">Nenhum conteúdo registrado.</span>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Tarefa para próxima aula</label>
                <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap min-h-[60px]">
                  {viewingClass.homework || <span className="text-slate-500 italic">Nenhuma tarefa registrada.</span>}
                </div>
              </div>
            </ModalBody>
          )}
        </ModalContent>
      </UIModal>

      {/* Edit Class Modal */}
      <UIModal open={!!editingClass} onOpenChange={(open) => { if (!open) setEditingClass(null); }}>
        <ModalContent size="xl">
          <ModalHeader>
            <ModalTitle>Editar Aula</ModalTitle>
          </ModalHeader>
          {editingClass && (
            <>
              <ModalBody>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">Status</label>
                    <Select
                      value={editingClass.status}
                      onValueChange={(v) => {
                        if (v === "COMPLETED") {
                          setEditingClass(null);
                          setCompletingClass({ id: editingClass.id, content: "", homework: "" });
                        } else {
                          setEditingClass({ ...editingClass, status: v });
                        }
                      }}
                    >
                      {Object.entries(statusConfig).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                      Data
                    </label>
                    <DatePicker
                      value={editingClass.date ? new Date(editingClass.date + "T12:00:00") : undefined}
                      onChange={(d) => setEditingClass({ ...editingClass, date: format(d, "yyyy-MM-dd") })}
                      placeholder="Selecione a data"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                        Início
                      </label>
                      <TimePicker value={editingClass.startTime} onChange={(val) => setEditingClass({ ...editingClass, startTime: val })} step={15} placeholder="Início" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                        Fim
                      </label>
                      <TimePicker value={editingClass.endTime} onChange={(val) => setEditingClass({ ...editingClass, endTime: val })} step={15} placeholder="Fim" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                      Plano da Aula
                    </label>
                    <Textarea
                      value={editingClass.content}
                      onChange={(e) => setEditingClass({ ...editingClass, content: e.target.value })}
                      placeholder="O que será trabalhado nesta aula..."
                      rows={10}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Excluir aula"
                  onClick={() => {
                    setDeletingClassId(editingClass.id);
                    setEditingClass(null);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <div className="flex gap-2 ml-auto">
                  <Button variant="ghost" onClick={() => setEditingClass(null)}>Cancelar</Button>
                  <Button
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
                          status: editingClass.status as ClassStatus,
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
                  >
                    {isUpdating ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </UIModal>

      {/* Complete Class Modal */}
      <UIModal open={!!completingClass} onOpenChange={(open) => { if (!open) setCompletingClass(null); }}>
        <ModalContent size="xl">
          <ModalHeader>
            <ModalTitle>Registrar Aula Concluída</ModalTitle>
          </ModalHeader>
          {completingClass && (
            <>
              <ModalBody>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                      O que foi feito *
                    </label>
                    <Textarea
                      value={completingClass.content}
                      onChange={(e) => setCompletingClass({ ...completingClass, content: e.target.value })}
                      placeholder="Descreva o conteúdo trabalhado na aula..."
                      rows={10}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                      Tarefa para próxima aula
                    </label>
                    <Textarea
                      value={completingClass.homework}
                      onChange={(e) => setCompletingClass({ ...completingClass, homework: e.target.value })}
                      placeholder="Ex: Exercícios pág. 34-36..."
                      rows={10}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" onClick={() => setCompletingClass(null)}>Cancelar</Button>
                <Button onClick={handleConfirmComplete} disabled={!completingClass.content.trim()} className="bg-emerald-600 hover:bg-emerald-500">Concluir e Notificar</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </UIModal>

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
