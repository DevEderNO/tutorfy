import { useState, useMemo } from "react";
import {
  useClasses,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
} from "../classes/hooks/useClasses";
import { useStudents } from "../students/hooks/useStudents";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  addMonths,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  nextDay,
  getDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Trash2,
  Filter,
  Download,
  GripVertical,
  Clock,
  Pencil,
} from "lucide-react";
import type { ClassStatus } from "@tutorfy/types";
import { getInitials } from "@/lib/utils";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Modal } from "@/components/Modal";
import { Header } from "@/components/layout/Header";
import { Search } from "lucide-react";

const statusConfig: Record<
  string,
  { bg: string; border: string; text: string; label: string; dot: string }
> = {
  SCHEDULED: {
    bg: "glass-btn",
    border: "border-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.3)]",
    text: "text-blue-400",
    label: "Agendada",
    dot: "bg-blue-500 shadow-[0_0_8px_#3b82f6]",
  },
  COMPLETED: {
    bg: "glass-btn",
    border: "border-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.3)]",
    text: "text-emerald-400",
    label: "Concluída",
    dot: "bg-emerald-500 shadow-[0_0_8px_#10b981]",
  },
  CANCELED: {
    bg: "bg-white/5",
    border: "border-slate-600",
    text: "text-slate-400",
    label: "Cancelada",
    dot: "bg-slate-500",
  },
  MISSED: {
    bg: "glass-btn",
    border: "border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.3)]",
    text: "text-red-400",
    label: "Falta",
    dot: "bg-red-500 shadow-[0_0_8px_#ef4444]",
  },
};

export function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [showNewClass, setShowNewClass] = useState(false);
  const [newClass, setNewClass] = useState({
    studentId: "",
    date: "",
    startTime: "",
    endTime: "",
    content: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    studentId: "",
    status: "",
  });
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

  const calendarStart =
    viewMode === "month"
      ? startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 })
      : startOfWeek(currentDate, { weekStartsOn: 0 });

  const calendarEnd =
    viewMode === "month"
      ? endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
      : endOfWeek(currentDate, { weekStartsOn: 0 });

  const daysOfCalendar = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const { data: classes } = useClasses({
    startDate: format(calendarStart, "yyyy-MM-dd"),
    endDate: format(calendarEnd, "yyyy-MM-dd"),
  });
  const { data: students } = useStudents();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();

  const filteredClasses = useMemo(() => {
    if (!classes) return [];
    return classes.filter((cls) => {
      const matchesStudent =
        !filters.studentId || cls.studentId === filters.studentId;
      const matchesStatus = !filters.status || cls.status === filters.status;
      return matchesStudent && matchesStatus;
    });
  }, [classes, filters]);

  const classesByDay = useMemo(() => {
    const map: Record<string, typeof classes> = {};
    daysOfCalendar.forEach((d) => {
      const key = format(d, "yyyy-MM-dd");
      map[key] =
        filteredClasses
          .filter((c) => format(new Date(c.date), "yyyy-MM-dd") === key)
          ?.sort((a, b) => a.startTime.localeCompare(b.startTime)) ?? [];
    });
    return map;
  }, [filteredClasses, daysOfCalendar]);

  // Derived metrics using filtered data
  const activeStudents = students?.filter((s) => s.active) || [];
  const scheduledStudentIds = new Set(filteredClasses.map((c) => c.studentId));
  const studentsWithoutClasses = activeStudents.filter(
    (s) => !scheduledStudentIds.has(s.id),
  );

  const totalClassesPeriod = filteredClasses.length;
  const completedClassesPeriod = filteredClasses.filter(
    (c) => c.status === "COMPLETED",
  ).length;
  const goalProgressPercentage =
    totalClassesPeriod > 0
      ? Math.round((completedClassesPeriod / totalClassesPeriod) * 100)
      : 0;

  const handleCreateClass = async () => {
    if (
      !newClass.studentId ||
      !newClass.date ||
      !newClass.startTime ||
      !newClass.endTime
    )
      return;
    await createClass.mutateAsync(newClass);
    setNewClass({
      studentId: "",
      date: "",
      startTime: "",
      endTime: "",
      content: "",
    });
    setShowNewClass(false);
  };

  const handleStatusChange = (id: string, status: ClassStatus) => {
    if (status === 'COMPLETED') {
      setCompletingClass({ id, content: '', homework: '' });
      return;
    }
    updateClass.mutate({ id, data: { status } });
  };

  const handleConfirmComplete = () => {
    if (!completingClass || !completingClass.content.trim()) return;
    updateClass.mutate({
      id: completingClass.id,
      data: {
        status: 'COMPLETED',
        content: completingClass.content.trim(),
        homework: completingClass.homework.trim() || undefined,
      },
    });
    setCompletingClass(null);
  };

  const handleSaveEdit = async () => {
    if (!editingClass || !editingClass.date || !editingClass.startTime || !editingClass.endTime) return;
    await updateClass.mutateAsync({
      id: editingClass.id,
      data: {
        studentId: editingClass.studentId,
        date: editingClass.date,
        startTime: editingClass.startTime,
        endTime: editingClass.endTime,
        content: editingClass.content || undefined,
      },
    });
    setEditingClass(null);
  };

  const navigatePrevious = () => {
    setCurrentDate((prev) =>
      viewMode === "month" ? addMonths(prev, -1) : addWeeks(prev, -1),
    );
  };

  const navigateNext = () => {
    setCurrentDate((prev) =>
      viewMode === "month" ? addMonths(prev, 1) : addWeeks(prev, 1),
    );
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const currentMonthName = format(currentDate, "MMMM yyyy", { locale: ptBR });
  const formattedMonthName =
    currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Agenda" />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (Aside) */}
        <aside className="w-64 glass-panel border-r border-white/10 flex flex-col shrink-0 hidden md:flex z-10 relative">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Visualização
            </h3>
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode("month")}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${viewMode === "month" ? "bg-primary text-white shadow-lg neon-glow" : "text-slate-400 hover:text-white"}`}
              >
                Mensal
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${viewMode === "week" ? "bg-primary text-white shadow-lg neon-glow" : "text-slate-400 hover:text-white"}`}
              >
                Semanal
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Status
              </h3>
              <div className="space-y-3">
                {Object.entries(statusConfig).map(([key, val]) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 text-xs text-slate-300 font-medium"
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${val.dot}`} />
                    {val.label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
                Sem Agenda
                <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full text-[10px]">
                  {studentsWithoutClasses.length}
                </span>
              </h3>
              <div className="space-y-2">
                {studentsWithoutClasses.length > 0 ? (
                  studentsWithoutClasses.map((student) => (
                    <div
                      key={student.id}
                      className="group flex items-center justify-between p-2 rounded-xl glass border-l-4 border-l-red-500/50 hover:border-white/20 transition-all cursor-default"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-slate-300">
                          {getInitials(student.name)}
                        </div>
                        <span className="text-xs font-semibold text-slate-100 truncate max-w-[120px]">
                          {student.name}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-500 italic px-2">
                    Todos alunos alocados.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-white/10">
            <div className="glass rounded-xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-200">
                    Progresso {viewMode === "month" ? "Mensal" : "Semanal"}
                  </h3>
                  <span className="text-[10px] font-bold text-primary">
                    {goalProgressPercentage}%
                  </span>
                </div>

                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-primary neon-glow relative transition-all duration-1000 ease-in-out"
                    style={{ width: `${goalProgressPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20"></div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">
                  {completedClassesPeriod} de {totalClassesPeriod} aulas
                  concluídas.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Calendar Area */}
        <main className="flex-1 flex flex-col bg-[#0A0A0B] overflow-hidden relative">
          <div className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-white/10 shrink-0 z-10 glass-panel">
            <div className="flex items-center gap-2 sm:gap-4">
              <h1 className="text-base sm:text-lg font-bold text-slate-100 capitalize truncate">
                {formattedMonthName}
              </h1>
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                <button
                  onClick={navigatePrevious}
                  className="p-1 hover:bg-white/10 rounded-md transition-all text-slate-400 hover:text-white"
                  aria-label="Múltiplos"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={navigateToday}
                  className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold hover:bg-white/10 rounded-md transition-all text-slate-200 uppercase tracking-wider"
                >
                  Hoje
                </button>
                <button
                  onClick={navigateNext}
                  className="p-1 hover:bg-white/10 rounded-md transition-all text-slate-400 hover:text-white"
                  aria-label="Próximo"
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all text-xs font-bold ${
                  showFilters || filters.studentId || filters.status
                    ? "bg-primary/20 border-primary/50 text-white shadow-[0_0_10px_rgba(116,61,245,0.2)]"
                    : "border-white/10 text-slate-300 hover:bg-white/5 glass-btn"
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                <span>Filtrar</span>
                {(filters.studentId || filters.status) && (
                  <span className="ml-1 flex h-1.5 w-1.5 rounded-full bg-primary neon-glow" />
                )}
              </button>
              <button className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-300 glass-btn">
                <Download className="h-3.5 w-3.5" /> Exportar
              </button>
              <button
                onClick={() => setShowNewClass(true)}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white neon-glow hover:brightness-110 transition-all sm:ml-2"
              >
                <Plus className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Nova Aula</span>
                <span className="sm:hidden">Aula</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          {showFilters && (
            <div className="glass-panel border-b border-white/10 p-4 z-10 animate-in slide-in-from-top duration-200">
              <div className="flex flex-wrap items-end gap-4 max-w-4xl mx-auto md:mx-0">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                    Filtrar por Aluno
                  </label>
                  <select
                    value={filters.studentId}
                    onChange={(e) =>
                      setFilters({ ...filters, studentId: e.target.value })
                    }
                    aria-label="Filtrar por Aluno"
                    className="w-full rounded-lg glass-input px-3 py-2 text-xs font-bold text-slate-200 outline-none transition-all"
                  >
                    <option value="" className="bg-slate-900 text-slate-200">
                      Todos os Alunos
                    </option>
                    {students?.map((s) => (
                      <option
                        key={s.id}
                        value={s.id}
                        className="bg-slate-900 text-slate-200"
                      >
                        {s.name} {s.active ? "" : "(Inativo)"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-48">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                    Status da Aula
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    aria-label="Status da Aula"
                    className="w-full rounded-lg glass-input px-3 py-2 text-xs font-bold text-slate-200 outline-none transition-all"
                  >
                    <option value="" className="bg-slate-900 text-slate-200">
                      Todos Status
                    </option>
                    {Object.entries(statusConfig).map(([key, val]) => (
                      <option
                        key={key}
                        value={key}
                        className="bg-slate-900 text-slate-200"
                      >
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>

                {(filters.studentId || filters.status) && (
                  <button
                    onClick={() => setFilters({ studentId: "", status: "" })}
                    className="px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1 mb-0.5"
                  >
                    <X className="h-3.5 w-3.5" /> Limpar
                  </button>
                )}
              </div>
            </div>
          )}

          <Modal
            isOpen={showNewClass}
            onClose={() => setShowNewClass(false)}
            title="Nova Aula"
          >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                        Aluno *
                      </label>
                      <select
                        value={newClass.studentId}
                        onChange={(e) =>
                          setNewClass({
                            ...newClass,
                            studentId: e.target.value,
                          })
                        }
                        aria-label="Selecione o aluno"
                        className="w-full glass-input rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-primary focus:border-primary transition-all font-medium outline-none"
                      >
                        <option
                          value=""
                          className="bg-slate-900 text-slate-200"
                        >
                          Selecione o aluno
                        </option>
                        {students
                          ?.filter((s) => s.active)
                          .map((s) => (
                            <option
                              key={s.id}
                              value={s.id}
                              className="bg-slate-900 text-slate-200"
                            >
                              {s.name}
                            </option>
                          ))}
                      </select>

                      {/* Student Schedule Preferences Chips */}
                      {newClass.studentId && (
                        <div className="mt-3">
                          {(() => {
                            const selectedStudent = students?.find(
                              (s) => s.id === newClass.studentId,
                            );
                            const preferences =
                              (selectedStudent as any)?.schedulePreferences ||
                              [];

                            if (preferences.length === 0) return null;

                            const dayNames = [
                              "Dom",
                              "Seg",
                              "Ter",
                              "Qua",
                              "Qui",
                              "Sex",
                              "Sáb",
                            ];

                            return (
                              <div className="space-y-2 mt-4">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1 flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> Sugestões de
                                  Horário
                                </label>
                                <div className="flex flex-wrap gap-2">
                                  {preferences.map((pref: any, idx: number) => {
                                    const label = `${dayNames[pref.dayOfWeek]} ${pref.startTime}`;
                                    const today = new Date();
                                    const targetDate =
                                      getDay(today) === pref.dayOfWeek
                                        ? today
                                        : nextDay(today, pref.dayOfWeek as any);
                                    const targetDateStr = format(
                                      targetDate,
                                      "yyyy-MM-dd",
                                    );
                                    const isSelected =
                                      newClass.date === targetDateStr &&
                                      newClass.startTime === pref.startTime;

                                    return (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                          setNewClass((prev) => ({
                                            ...prev,
                                            date: targetDateStr,
                                            startTime: pref.startTime,
                                            endTime: pref.endTime,
                                          }));
                                        }}
                                        className={`text-[10px] px-3 py-1.5 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 ${
                                          isSelected
                                            ? "bg-primary/20 text-primary border border-primary/50 neon-glow"
                                            : "bg-white/5 text-slate-400 border border-white/10 hover:border-white/30"
                                        }`}
                                      >
                                        {label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                          Data *
                        </label>
                        <input
                          type="date"
                          value={newClass.date}
                          onChange={(e) =>
                            setNewClass({ ...newClass, date: e.target.value })
                          }
                          aria-label="Data da aula"
                          className="w-full glass-input rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-primary focus:border-primary transition-all font-medium outline-none [color-scheme:dark]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 col-span-2">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                            Início *
                          </label>
                          <input
                            type="time"
                            value={newClass.startTime}
                            onChange={(e) => {
                              const val = e.target.value;
                              const end =
                                newClass.endTime ||
                                (val
                                  ? `${String((parseInt(val.split(":")[0]) + 1) % 24).padStart(2, "0")}:${val.split(":")[1]}`
                                  : "");
                              setNewClass({
                                ...newClass,
                                startTime: val,
                                endTime: end,
                              });
                            }}
                            aria-label="Horário de início"
                            className="w-full glass-input rounded-xl px-3 py-3 text-sm text-slate-200 focus:ring-primary focus:border-primary transition-all font-medium outline-none [color-scheme:dark]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                            Fim *
                          </label>
                          <input
                            type="time"
                            value={newClass.endTime}
                            onChange={(e) =>
                              setNewClass({
                                ...newClass,
                                endTime: e.target.value,
                              })
                            }
                            aria-label="Horário de fim"
                            className="w-full glass-input rounded-xl px-3 py-3 text-sm text-slate-200 focus:ring-primary focus:border-primary transition-all font-medium outline-none [color-scheme:dark]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                        Plano da Aula
                      </label>
                      <textarea
                        value={newClass.content}
                        onChange={(e) =>
                          setNewClass({ ...newClass, content: e.target.value })
                        }
                        placeholder="O que será trabalhado nesta aula..."
                        rows={2}
                        className="w-full glass-input rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-primary focus:border-primary transition-all font-medium outline-none resize-none"
                      />
                    </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button
                      onClick={() => setShowNewClass(false)}
                      className="w-full py-3.5 rounded-xl font-bold text-sm text-slate-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateClass}
                      disabled={
                        !newClass.studentId ||
                        !newClass.date ||
                        !newClass.startTime ||
                        !newClass.endTime
                      }
                      className="w-full bg-primary py-3.5 rounded-xl text-white font-bold text-sm neon-glow hover:brightness-110 disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                      Agendar
                    </button>
                  </div>
          </Modal>

          <div className="flex-1 overflow-auto p-4 sm:p-6 custom-scrollbar relative z-0">
            <div className="min-w-[800px] h-full flex flex-col glass rounded-xl overflow-hidden shadow-2xl relative">
              <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
              {/* Days Header */}
              <div className="grid grid-cols-7 border-b border-white/10 bg-white/5 relative z-10 backdrop-blur-sm">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                  (day) => (
                    <div
                      key={day}
                      className="py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest"
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>

              {/* Calendar Grid */}
              <div className="flex-1 grid grid-cols-7 auto-rows-[minmax(120px,1fr)] relative z-10">
                {daysOfCalendar.map((day, idx) => {
                  const key = format(day, "yyyy-MM-dd");
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isCurrentDay = isToday(day);
                  const dayClasses = classesByDay[key] || [];

                  return (
                    <div
                      key={key}
                      className={`p-2 border-r border-b border-white/5 relative group transition-colors hover:bg-white/5
                      ${!isCurrentMonth ? "bg-black/40 text-slate-600" : "bg-transparent text-slate-300"}
                      ${isCurrentDay ? "bg-primary/5" : ""}
                      ${(idx + 1) % 7 === 0 ? "border-r-0" : ""}
                      ${idx >= daysOfCalendar.length - 7 ? "border-b-0" : ""}
                    `}
                    >
                      <div className="flex justify-between items-start mb-2 relative z-20">
                        <div
                          className={`relative flex items-center justify-center w-7 h-7 ${isCurrentDay ? "" : "p-1"}`}
                        >
                          {isCurrentDay && (
                            <div className="absolute inset-0 bg-primary/20 neon-border rounded-lg" />
                          )}
                          <span
                            className={`text-xs font-bold relative z-10 ${isCurrentDay ? "text-primary" : ""}`}
                          >
                            {format(day, "d")}
                          </span>
                        </div>

                        {isCurrentMonth && (
                          <button
                            onClick={() => {
                              setNewClass((prev) => ({ ...prev, date: key }));
                              setShowNewClass(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-white transition-opacity hover:bg-white/10 rounded-md"
                            title="Agendar neste dia"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="absolute top-[40px] bottom-2 left-2 right-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-1.5 z-20">
                        {dayClasses.map((cls) => {
                          const statusColor =
                            statusConfig[cls.status ?? "SCHEDULED"];

                          return (
                            <div
                              key={cls.id}
                              className={`group/item relative rounded-lg ${statusColor?.bg} border-l-[3px] ${statusColor?.border} p-2 transition-all hover:-translate-y-0.5 flex flex-col gap-1 overflow-hidden`}
                            >
                              <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent to-white/[0.02] pointer-events-none"></div>
                              <div className="flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`text-[10px] font-bold ${statusColor?.text} ${cls.status === "CANCELED" ? "line-through opacity-70" : ""}`}
                                  >
                                    {cls.startTime}
                                  </span>
                                </div>

                                <div className="opacity-0 group-hover/item:opacity-100 flex items-center bg-slate-900/90 backdrop-blur-md rounded-md absolute right-0 top-0 bottom-0 px-1 shadow-lg transition-opacity border border-white/10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingClass({
                                        id: cls.id,
                                        studentId: cls.studentId,
                                        date: format(new Date(cls.date), "yyyy-MM-dd"),
                                        startTime: cls.startTime,
                                        endTime: cls.endTime,
                                        content: cls.content ?? "",
                                      });
                                    }}
                                    className="p-1 text-slate-400 hover:text-primary transition-colors"
                                    title="Editar aula"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <select
                                    value={cls.status}
                                    onChange={(e) =>
                                      handleStatusChange(
                                        cls.id,
                                        e.target.value as ClassStatus,
                                      )
                                    }
                                    aria-label="Status da aula"
                                    className="h-full py-0 pl-1 pr-6 text-[10px] bg-transparent border-0 focus:ring-0 mr-1 text-slate-300 font-medium cursor-pointer outline-none"
                                    title="Alterar status"
                                  >
                                    {Object.entries(statusConfig).map(
                                      ([k, v]) => (
                                        <option
                                          key={k}
                                          value={k}
                                          className="bg-slate-800 text-slate-200"
                                        >
                                          {v.label}
                                        </option>
                                      ),
                                    )}
                                  </select>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeletingClassId(cls.id);
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                                    title="Remover aula"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                              <p
                                className={`text-xs truncate font-semibold relative z-10 ${!isCurrentMonth || cls.status === "CANCELED" ? "text-slate-500" : "text-slate-200"}`}
                              >
                                {(cls as any).student?.name || "Aluno(a)"}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Fab */}
        <button
          onClick={() => setShowNewClass(true)}
          className="fixed bottom-6 right-6 md:hidden h-14 w-14 rounded-full bg-primary neon-glow text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 focus:outline-none"
          aria-label="Nova Aula"
        >
          <Plus className="h-6 w-6" />
        </button>

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
                  Aluno
                </label>
                <select
                  value={editingClass.studentId}
                  onChange={(e) => setEditingClass({ ...editingClass, studentId: e.target.value })}
                  aria-label="Selecione o aluno"
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-slate-200 transition-all font-medium outline-none"
                >
                  {students?.filter((s) => s.active).map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                  Data
                </label>
                <input
                  type="date"
                  value={editingClass.date}
                  onChange={(e) => setEditingClass({ ...editingClass, date: e.target.value })}
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
                    onChange={(e) => setEditingClass({ ...editingClass, startTime: e.target.value })}
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
                    onChange={(e) => setEditingClass({ ...editingClass, endTime: e.target.value })}
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
                  onChange={(e) => setEditingClass({ ...editingClass, content: e.target.value })}
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
                  onClick={handleSaveEdit}
                  disabled={!editingClass.date || !editingClass.startTime || !editingClass.endTime || updateClass.isPending}
                  className="w-full bg-primary py-3.5 rounded-xl text-white font-bold text-sm neon-glow hover:brightness-110 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  {updateClass.isPending ? "Salvando..." : "Salvar"}
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

        {/* Confirmation Modals */}
        <ConfirmModal
          isOpen={!!deletingClassId}
          onClose={() => setDeletingClassId(null)}
          onConfirm={() => {
            if (deletingClassId) {
              deleteClass.mutate(deletingClassId);
              setDeletingClassId(null);
            }
          }}
          title="Remover Aula"
          description="Tem certeza que deseja remover esta aula? Esta ação não pode ser desfeita."
          confirmLabel="Sim, Remover"
          cancelLabel="Agora não"
          variant="danger"
          icon={Trash2}
        />
      </div>
    </div>
  );
}
