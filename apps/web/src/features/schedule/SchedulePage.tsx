import { useState, useMemo, useEffect } from "react";
import {
  useClasses,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
} from "@/hooks/classes/useClasses";
import {
  useStudents,
  useStudentsInfinite,
} from "../students/hooks/useStudents";
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
  Clock,
} from "lucide-react";
import type { ClassStatus, LessonPlanResult } from "@tutorfy/types";
import { getInitials } from "@/lib/utils";
import { ConfirmModal } from "@/components/ConfirmModal";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@tutorfy/ui";
import { Button } from "@tutorfy/ui";
import { Textarea } from "@tutorfy/ui";
import { Select, SelectItem } from "@tutorfy/ui";
import { SearchSelect } from "@tutorfy/ui";
import { DatePicker } from "@tutorfy/ui";
import { TimePicker } from "@tutorfy/ui";
import { Header } from "@/components/layout/Header";
import { Search, Sparkles } from "lucide-react";
import { MicButton } from "@/components/MicButton";
import { toast } from "@tutorfy/ui";
import { useAuth } from "@/lib/auth";
import { useGenerateLessonPlan } from "@/hooks/ai/useLessonPlan";
import { useGenerateStudentEvolution } from "@/hooks/ai/useStudentEvolution";

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
    homework: "",
    notes: "",
  });
  const [studentSearch, setStudentSearch] = useState("");
  const [editStudentSearch, setEditStudentSearch] = useState("");
  const [lessonPlanDraft, setLessonPlanDraft] =
    useState<LessonPlanResult | null>(null);
  const [showLessonPlanReview, setShowLessonPlanReview] = useState(false);
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
  const { data: studentsResult } = useStudents();
  const students = studentsResult?.data ?? [];

  const {
    data: studentsInfiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingStudents,
  } = useStudentsInfinite({
    active: "true",
    search: studentSearch || undefined,
    sortBy: "name",
  });

  const {
    data: editStudentsInfiniteData,
    fetchNextPage: editFetchNextPage,
    hasNextPage: editHasNextPage,
    isFetchingNextPage: editIsFetchingNextPage,
    isLoading: editIsLoadingStudents,
  } = useStudentsInfinite({
    active: "true",
    search: editStudentSearch || undefined,
    sortBy: "name",
  });
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();
  const { user } = useAuth();
  const generateLessonPlan = useGenerateLessonPlan();
  const generateEvolution = useGenerateStudentEvolution();
  const lessonPlanMode = user?.lessonPlanAiMode ?? "OFF";

  useEffect(() => {
    if (lessonPlanMode !== "AUTO" || !showNewClass || !newClass.studentId)
      return;
    const promise = generateLessonPlan
      .mutateAsync(newClass.studentId)
      .then((plan) => {
        setNewClass((prev) => ({
          ...prev,
          content: plan.content ?? prev.content,
          homework: plan.homework ?? prev.homework,
          notes: plan.notes ?? prev.notes,
        }));
        return plan;
      });
    toast.promise(promise, {
      loading: "Gerando plano de aula com IA...",
      success: "Plano de aula sugerido com sucesso!",
      error: "Não foi possível gerar o plano de aula.",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newClass.studentId, showNewClass]);

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
      homework: "",
      notes: "",
    });
    setShowNewClass(false);
  };

  const resetNewClass = () => {
    setNewClass({
      studentId: "",
      date: "",
      startTime: "",
      endTime: "",
      content: "",
      homework: "",
      notes: "",
    });
    setStudentSearch("");
  };

  const handleDemandLessonPlan = () => {
    if (!newClass.studentId) return;
    generateLessonPlan
      .mutateAsync(newClass.studentId)
      .then((plan) => {
        setLessonPlanDraft(plan);
        setShowLessonPlanReview(true);
      })
      .catch(() => {
        /* silencia erros */
      });
  };

  const handleApplyLessonPlanDraft = () => {
    if (!lessonPlanDraft) return;
    setNewClass((prev) => ({
      ...prev,
      content: lessonPlanDraft.content ?? prev.content,
      notes: lessonPlanDraft.notes ?? prev.notes,
    }));
    setShowLessonPlanReview(false);
    setLessonPlanDraft(null);
  };

  const handleStatusChange = (id: string, status: ClassStatus) => {
    if (status === "COMPLETED") {
      setCompletingClass({ id, content: "", homework: "" });
      return;
    }
    updateClass.mutate({ id, data: { status } });
  };

  const handleConfirmComplete = async () => {
    if (!completingClass || !completingClass.content.trim()) return;
    const sessionId = completingClass.id;
    await updateClass.mutateAsync({
      id: sessionId,
      data: {
        status: "COMPLETED",
        content: completingClass.content.trim(),
        homework: completingClass.homework.trim() || undefined,
      },
    });
    setCompletingClass(null);
    toast.promise(generateEvolution.mutateAsync(sessionId), {
      loading: "Gerando registro de evolução com IA...",
      success: "Evolução registrada com sucesso!",
      error: "Não foi possível gerar a evolução.",
    });
  };

  const handleSaveEdit = async () => {
    if (
      !editingClass ||
      !editingClass.date ||
      !editingClass.startTime ||
      !editingClass.endTime
    )
      return;
    await updateClass.mutateAsync({
      id: editingClass.id,
      data: {
        studentId: editingClass.studentId,
        date: editingClass.date,
        startTime: editingClass.startTime,
        endTime: editingClass.endTime,
        content: editingClass.content || undefined,
        status: editingClass.status as ClassStatus,
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
        <aside className="w-64 glass-panel border-r border-white/10 flex flex-col shrink-0 md:flex z-10 relative">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Visualização
            </h3>
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("month")}
                className={`rounded-lg text-xs font-bold ${viewMode === "month" ? "bg-primary text-white shadow-lg neon-glow hover:bg-primary" : "text-slate-400 hover:text-white"}`}
              >
                Mensal
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("week")}
                className={`rounded-lg text-xs font-bold ${viewMode === "week" ? "bg-primary text-white shadow-lg neon-glow hover:bg-primary" : "text-slate-400 hover:text-white"}`}
              >
                Semanal
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Status
              </h3>
              <div className="space-y-1">
                {Object.entries(statusConfig).map(([key, val]) => {
                  const isActive = filters.status === key;
                  return (
                    <div
                      key={key}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          status: prev.status === key ? "" : key,
                        }))
                      }
                      className={`flex items-center gap-3 text-xs font-medium px-2 py-1.5 rounded-lg cursor-pointer transition-all select-none
                        ${isActive ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full shrink-0 ${val.dot}`}
                      />
                      {val.label}
                      {isActive && (
                        <X className="h-3 w-3 ml-auto text-slate-400" />
                      )}
                    </div>
                  );
                })}
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
                      className="group flex items-center justify-between p-2 rounded-xl glass border-l-4 border-l-red-500/50 hover:border-white/20 transition-all cursor-pointer"
                      onClick={() => {
                        setNewClass((prev) => ({
                          ...prev,
                          studentId: student.id,
                        }));
                        setShowNewClass(true);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-slate-300">
                          {getInitials(student.name)}
                        </div>
                        <span className="text-xs font-semibold text-slate-100 truncate max-w-30">
                          {student.name}
                        </span>
                      </div>
                      <Plus className="h-3.5 w-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={navigatePrevious}
                  aria-label="Mês anterior"
                >
                  <ChevronLeft className="sm:!size-5!" />
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={navigateToday}
                  className="text-[10px] sm:text-xs uppercase tracking-wider"
                >
                  Hoje
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={navigateNext}
                  aria-label="Próximo"
                >
                  <ChevronRight className="sm:!size-5!" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3">
              <Button
                variant={
                  showFilters || filters.studentId || filters.status
                    ? "primary"
                    : "glass"
                }
                size="md"
                onClick={() => setShowFilters(!showFilters)}
                className={
                  showFilters || filters.studentId || filters.status
                    ? "bg-primary/20 border-primary/50 shadow-[0_0_10px_rgba(116,61,245,0.2)]"
                    : ""
                }
              >
                <Filter className="h-3.5 w-3.5" />
                <span>Filtrar</span>
                {(filters.studentId || filters.status) && (
                  <span className="ml-1 flex h-1.5 w-1.5 rounded-full bg-primary neon-glow" />
                )}
              </Button>
              <Button variant="glass" size="md" className="hidden sm:flex">
                <Download className="h-3.5 w-3.5" /> Exportar
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowNewClass(true)}
                className="neon-glow sm:ml-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nova Aula</span>
                <span className="sm:hidden">Aula</span>
              </Button>
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
                  <Select
                    value={filters.studentId || undefined}
                    onValueChange={(v) =>
                      setFilters({ ...filters, studentId: v })
                    }
                    placeholder="Todos os Alunos"
                    size="md"
                  >
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} {s.active ? "" : "(Inativo)"}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="w-48">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                    Status da Aula
                  </label>
                  <Select
                    value={filters.status || undefined}
                    onValueChange={(v) => setFilters({ ...filters, status: v })}
                    placeholder="Todos Status"
                    size="md"
                  >
                    {Object.entries(statusConfig).map(([key, val]) => (
                      <SelectItem key={key} value={key}>
                        {val.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {(filters.studentId || filters.status) && (
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setFilters({ studentId: "", status: "" })}
                    className="text-destructive hover:text-destructive mb-0.5"
                  >
                    <X className="h-3.5 w-3.5" /> Limpar
                  </Button>
                )}
              </div>
            </div>
          )}

          <Modal
            open={showNewClass}
            onOpenChange={(open) => {
              setShowNewClass(open);
              if (!open) resetNewClass();
            }}
          >
            <ModalContent size="xl">
              <ModalHeader>
                <ModalTitle>Nova Aula</ModalTitle>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                    Aluno *
                  </label>
                  <SearchSelect
                    value={newClass.studentId}
                    onValueChange={(v) =>
                      setNewClass({ ...newClass, studentId: v })
                    }
                    options={(studentsInfiniteData?.pages ?? []).flatMap((p) =>
                      p.data.map((s) => ({ value: s.id, label: s.name })),
                    )}
                    search={studentSearch}
                    onSearchChange={setStudentSearch}
                    hasNextPage={hasNextPage}
                    onLoadMore={fetchNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    isLoading={isLoadingStudents}
                    placeholder="Selecione o aluno"
                  />

                  {newClass.studentId &&
                    (() => {
                      const selectedStudent = students.find(
                        (s) => s.id === newClass.studentId,
                      );
                      const preferences =
                        (selectedStudent as any)?.schedulePreferences || [];
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
                        <div className="space-y-2 mt-3">
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Sugestões de Horário
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
                                  onClick={() =>
                                    setNewClass((prev) => ({
                                      ...prev,
                                      date: targetDateStr,
                                      startTime: pref.startTime,
                                      endTime: pref.endTime,
                                    }))
                                  }
                                  className={`text-[10px] px-3 py-1.5 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 ${isSelected ? "bg-primary/20 text-primary border border-primary/50 neon-glow" : "bg-white/5 text-slate-400 border border-white/10 hover:border-white/30"}`}
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

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                    Data *
                  </label>
                  <DatePicker
                    value={
                      newClass.date
                        ? new Date(newClass.date + "T12:00:00")
                        : undefined
                    }
                    onChange={(d) =>
                      setNewClass({
                        ...newClass,
                        date: format(d, "yyyy-MM-dd"),
                      })
                    }
                    placeholder="Selecione a data"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                      Início *
                    </label>
                    <TimePicker
                      value={newClass.startTime}
                      onChange={(val) => {
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
                      step={15}
                      placeholder="Início"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                      Fim *
                    </label>
                    <TimePicker
                      value={newClass.endTime}
                      onChange={(val) =>
                        setNewClass({ ...newClass, endTime: val })
                      }
                      step={15}
                      placeholder="Fim"
                    />
                  </div>
                </div>

                {lessonPlanMode === "DEMAND" && newClass.studentId && (
                  <div className="flex justify-end">
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={handleDemandLessonPlan}
                      disabled={generateLessonPlan.isPending}
                      className="border-primary/30 text-primary hover:border-primary/60"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {generateLessonPlan.isPending
                        ? "Gerando..."
                        : "Sugerir Plano"}
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Plano da Aula
                    </label>
                    <MicButton
                      onAppend={(text) =>
                        setNewClass((prev) => ({
                          ...prev,
                          content:
                            prev.content +
                            (prev.content.trim() ? " " : "") +
                            text,
                        }))
                      }
                    />
                  </div>
                  <div
                    className={`relative rounded-xl transition-all ${generateLessonPlan.isPending && lessonPlanMode === "AUTO" ? "animate-pulse" : ""}`}
                  >
                    <Textarea
                      value={newClass.content}
                      onChange={(e) =>
                        setNewClass({ ...newClass, content: e.target.value })
                      }
                      placeholder={
                        generateLessonPlan.isPending &&
                        lessonPlanMode === "AUTO"
                          ? "Gerando sugestão com IA..."
                          : "O que será trabalhado nesta aula..."
                      }
                      rows={5}
                      disabled={
                        generateLessonPlan.isPending &&
                        lessonPlanMode === "AUTO"
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Notas / Observações
                    </label>
                    <MicButton
                      onAppend={(text) =>
                        setNewClass((prev) => ({
                          ...prev,
                          notes:
                            prev.notes + (prev.notes.trim() ? " " : "") + text,
                        }))
                      }
                    />
                  </div>
                  <div
                    className={`relative rounded-xl transition-all ${generateLessonPlan.isPending && lessonPlanMode === "AUTO" ? "animate-pulse" : ""}`}
                  >
                    <Textarea
                      value={newClass.notes}
                      onChange={(e) =>
                        setNewClass({ ...newClass, notes: e.target.value })
                      }
                      placeholder={
                        generateLessonPlan.isPending &&
                        lessonPlanMode === "AUTO"
                          ? "Gerando sugestão com IA..."
                          : "Observações adicionais sobre a aula..."
                      }
                      rows={5}
                      disabled={
                        generateLessonPlan.isPending &&
                        lessonPlanMode === "AUTO"
                      }
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowNewClass(false);
                    resetNewClass();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateClass}
                  disabled={
                    !newClass.studentId ||
                    !newClass.date ||
                    !newClass.startTime ||
                    !newClass.endTime ||
                    createClass.isPending
                  }
                >
                  {createClass.isPending ? "Agendando..." : "Agendar"}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Lesson Plan Review Modal (DEMAND mode) */}
          <Modal
            open={showLessonPlanReview}
            onOpenChange={(open) => {
              if (!open) {
                setShowLessonPlanReview(false);
                setLessonPlanDraft(null);
              }
            }}
          >
            <ModalContent size="xl">
              <ModalHeader>
                <ModalTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Sugestão de Plano de Aula
                </ModalTitle>
              </ModalHeader>
              {lessonPlanDraft && (
                <>
                  <ModalBody>
                    <p className="text-xs text-slate-400 mb-4">
                      Revise e edite a sugestão gerada pela IA antes de aplicar
                      ao formulário.
                    </p>
                    {lessonPlanDraft.content !== undefined && (
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                          Plano da Aula
                        </label>
                        <Textarea
                          value={lessonPlanDraft.content}
                          onChange={(e) =>
                            setLessonPlanDraft((prev) =>
                              prev
                                ? { ...prev, content: e.target.value }
                                : prev,
                            )
                          }
                          rows={5}
                        />
                      </div>
                    )}
                    {lessonPlanDraft.notes !== undefined && (
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                          Notas / Observações
                        </label>
                        <Textarea
                          value={lessonPlanDraft.notes}
                          onChange={(e) =>
                            setLessonPlanDraft((prev) =>
                              prev ? { ...prev, notes: e.target.value } : prev,
                            )
                          }
                          rows={5}
                        />
                      </div>
                    )}
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowLessonPlanReview(false);
                        setLessonPlanDraft(null);
                      }}
                    >
                      Descartar
                    </Button>
                    <Button
                      onClick={handleApplyLessonPlanDraft}
                      className="neon-glow"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Aplicar Sugestão
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>

          <div className="flex-1 overflow-auto p-4 sm:p-6 custom-scrollbar relative z-0">
            <div className="min-w-200 h-full flex flex-col glass rounded-xl overflow-hidden shadow-2xl relative">
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
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setNewClass((prev) => ({ ...prev, date: key }));
                              setShowNewClass(true);
                            }}
                            aria-label="Agendar neste dia"
                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-opacity"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="absolute top-10 bottom-2 left-2 right-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-1.5 z-20">
                        {dayClasses.map((cls) => {
                          const statusColor =
                            statusConfig[cls.status ?? "SCHEDULED"];

                          return (
                            <div
                              key={cls.id}
                              onClick={() => {
                                if (cls.status === "COMPLETED") {
                                  setViewingClass({
                                    studentName:
                                      (cls as any).student?.name ?? "Aluno(a)",
                                    date: format(
                                      new Date(cls.date),
                                      "dd 'de' MMMM 'de' yyyy",
                                      { locale: ptBR },
                                    ),
                                    startTime: cls.startTime,
                                    endTime: cls.endTime,
                                    content: cls.content ?? "",
                                    homework: cls.homework ?? null,
                                  });
                                } else {
                                  setEditingClass({
                                    id: cls.id,
                                    studentId: cls.studentId,
                                    date: format(
                                      new Date(cls.date),
                                      "yyyy-MM-dd",
                                    ),
                                    startTime: cls.startTime,
                                    endTime: cls.endTime,
                                    content: cls.content ?? "",
                                    status: cls.status ?? "SCHEDULED",
                                  });
                                }
                              }}
                              className={`relative rounded-lg ${statusColor?.bg} border-l-[3px] ${statusColor?.border} p-2 flex flex-col gap-1 cursor-pointer`}
                            >
                              <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent to-white/2 pointer-events-none"></div>
                              <div className="relative z-10">
                                <span
                                  className={`text-[10px] font-bold ${statusColor?.text} ${cls.status === "CANCELED" ? "line-through opacity-70" : ""}`}
                                >
                                  {cls.startTime}
                                </span>
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
          open={!!editingClass}
          onOpenChange={(open) => {
            if (!open) {
              setEditingClass(null);
              setEditStudentSearch("");
            }
          }}
        >
          <ModalContent size="xl">
            <ModalHeader>
              <ModalTitle>Editar Aula</ModalTitle>
            </ModalHeader>
            {editingClass && (
              <>
                <ModalBody>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                      Status
                    </label>
                    <Select
                      value={editingClass.status}
                      onValueChange={(v) => {
                        if (v === "COMPLETED") {
                          setEditingClass(null);
                          setCompletingClass({
                            id: editingClass.id,
                            content: "",
                            homework: "",
                          });
                        } else {
                          setEditingClass({ ...editingClass, status: v });
                        }
                      }}
                    >
                      {Object.entries(statusConfig).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                      Aluno
                    </label>
                    <SearchSelect
                      value={editingClass.studentId}
                      onValueChange={(v) =>
                        setEditingClass({ ...editingClass, studentId: v })
                      }
                      options={(editStudentsInfiniteData?.pages ?? []).flatMap(
                        (p) =>
                          p.data.map((s) => ({ value: s.id, label: s.name })),
                      )}
                      search={editStudentSearch}
                      onSearchChange={setEditStudentSearch}
                      hasNextPage={editHasNextPage}
                      onLoadMore={editFetchNextPage}
                      isLoading={editIsLoadingStudents}
                      isFetchingNextPage={editIsFetchingNextPage}
                      placeholder="Selecione o aluno"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                      Data
                    </label>
                    <DatePicker
                      value={
                        editingClass.date
                          ? new Date(editingClass.date + "T12:00:00")
                          : undefined
                      }
                      onChange={(d) =>
                        setEditingClass({
                          ...editingClass,
                          date: format(d, "yyyy-MM-dd"),
                        })
                      }
                      placeholder="Selecione a data"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                        Início
                      </label>
                      <TimePicker
                        value={editingClass.startTime}
                        onChange={(val) =>
                          setEditingClass({ ...editingClass, startTime: val })
                        }
                        step={15}
                        placeholder="Início"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                        Fim
                      </label>
                      <TimePicker
                        value={editingClass.endTime}
                        onChange={(val) =>
                          setEditingClass({ ...editingClass, endTime: val })
                        }
                        step={15}
                        placeholder="Fim"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Plano da Aula
                      </label>
                      <MicButton
                        onAppend={(text) =>
                          setEditingClass((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  content:
                                    prev.content +
                                    (prev.content.trim() ? " " : "") +
                                    text,
                                }
                              : prev,
                          )
                        }
                      />
                    </div>
                    <Textarea
                      value={editingClass.content}
                      onChange={(e) =>
                        setEditingClass({
                          ...editingClass,
                          content: e.target.value,
                        })
                      }
                      placeholder="O que será trabalhado nesta aula..."
                      rows={10}
                    />
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
                    <Button
                      variant="ghost"
                      onClick={() => setEditingClass(null)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveEdit}
                      disabled={
                        !editingClass.date ||
                        !editingClass.startTime ||
                        !editingClass.endTime ||
                        updateClass.isPending
                      }
                    >
                      {updateClass.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Complete Class Modal */}
        <Modal
          open={!!completingClass}
          onOpenChange={(open) => {
            if (!open) setCompletingClass(null);
          }}
        >
          <ModalContent size="xl">
            <ModalHeader>
              <ModalTitle>Registrar Aula Concluída</ModalTitle>
            </ModalHeader>
            {completingClass && (
              <>
                <ModalBody>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        O que foi feito *
                      </label>
                      <MicButton
                        onAppend={(text) =>
                          setCompletingClass((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  content:
                                    prev.content +
                                    (prev.content.trim() ? " " : "") +
                                    text,
                                }
                              : prev,
                          )
                        }
                      />
                    </div>
                    <Textarea
                      value={completingClass.content}
                      onChange={(e) =>
                        setCompletingClass({
                          ...completingClass,
                          content: e.target.value,
                        })
                      }
                      placeholder="Descreva o conteúdo trabalhado na aula..."
                      rows={10}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Tarefa para próxima aula
                      </label>
                      <MicButton
                        onAppend={(text) =>
                          setCompletingClass((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  homework:
                                    prev.homework +
                                    (prev.homework.trim() ? " " : "") +
                                    text,
                                }
                              : prev,
                          )
                        }
                      />
                    </div>
                    <Textarea
                      value={completingClass.homework}
                      onChange={(e) =>
                        setCompletingClass({
                          ...completingClass,
                          homework: e.target.value,
                        })
                      }
                      placeholder="Ex: Exercícios pág. 34-36..."
                      rows={10}
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setCompletingClass(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleConfirmComplete}
                    disabled={!completingClass.content.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500"
                  >
                    Concluir e Notificar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* View Completed Class Modal */}
        <Modal
          open={!!viewingClass}
          onOpenChange={(open) => {
            if (!open) setViewingClass(null);
          }}
        >
          <ModalContent size="xl">
            <ModalHeader>
              <ModalTitle>Aula Concluída</ModalTitle>
            </ModalHeader>
            {viewingClass && (
              <ModalBody>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-400 mb-4">
                  <span>
                    <span className="font-semibold text-slate-200">Aluno:</span>{" "}
                    {viewingClass.studentName}
                  </span>
                  <span>
                    <span className="font-semibold text-slate-200">Data:</span>{" "}
                    {viewingClass.date}
                  </span>
                  <span>
                    <span className="font-semibold text-slate-200">
                      Horário:
                    </span>{" "}
                    {viewingClass.startTime} – {viewingClass.endTime}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                    O que foi feito
                  </label>
                  <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap min-h-20">
                    {viewingClass.content || (
                      <span className="text-slate-500 italic">
                        Nenhum conteúdo registrado.
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                    Tarefa para próxima aula
                  </label>
                  <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap min-h-15">
                    {viewingClass.homework || (
                      <span className="text-slate-500 italic">
                        Nenhuma tarefa registrada.
                      </span>
                    )}
                  </div>
                </div>
              </ModalBody>
            )}
          </ModalContent>
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
