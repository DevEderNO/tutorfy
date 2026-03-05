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
  Clock
} from "lucide-react";
import type { ClassStatus } from "@tutorfy/types";
import { getInitials } from "@/lib/utils";
import { ConfirmModal } from "@/components/ConfirmModal";

const statusConfig: Record<string, { bg: string; border: string; text: string; label: string; dot: string }> = {
  SCHEDULED: { bg: "bg-blue-500/10 dark:bg-blue-500/20", border: "border-blue-500", text: "text-blue-600 dark:text-blue-400", label: "Agendada", dot: "bg-blue-500" },
  COMPLETED: { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", border: "border-emerald-500", text: "text-emerald-600 dark:text-emerald-400", label: "Concluída", dot: "bg-emerald-500" },
  CANCELED: { bg: "bg-slate-500/10 dark:bg-slate-500/20", border: "border-slate-500", text: "text-slate-500 dark:text-slate-400", label: "Cancelada", dot: "bg-slate-500" },
  MISSED: { bg: "bg-red-500/10 dark:bg-red-500/20", border: "border-red-500", text: "text-red-600 dark:text-red-400", label: "Falta", dot: "bg-red-500" },
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

  const calendarStart = viewMode === "month" 
    ? startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 }) 
    : startOfWeek(currentDate, { weekStartsOn: 0 });
    
  const calendarEnd = viewMode === "month"
    ? endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
    : endOfWeek(currentDate, { weekStartsOn: 0 });

  const daysOfCalendar = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

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
      const matchesStudent = !filters.studentId || cls.studentId === filters.studentId;
      const matchesStatus = !filters.status || cls.status === filters.status;
      return matchesStudent && matchesStatus;
    });
  }, [classes, filters]);

  const classesByDay = useMemo(() => {
    const map: Record<string, typeof classes> = {};
    daysOfCalendar.forEach((d) => {
      const key = format(d, "yyyy-MM-dd");
      map[key] =
        filteredClasses.filter(
          (c) => format(new Date(c.date), "yyyy-MM-dd") === key,
        )?.sort((a, b) => a.startTime.localeCompare(b.startTime)) ?? [];
    });
    return map;
  }, [filteredClasses, daysOfCalendar]);

  // Derived metrics using filtered data
  const activeStudents = students?.filter(s => s.active) || [];
  const scheduledStudentIds = new Set(filteredClasses.map(c => c.studentId));
  const studentsWithoutClasses = activeStudents.filter(s => !scheduledStudentIds.has(s.id));

  const totalClassesPeriod = filteredClasses.length;
  const completedClassesPeriod = filteredClasses.filter(c => c.status === "COMPLETED").length;
  const goalProgressPercentage = totalClassesPeriod > 0 ? Math.round((completedClassesPeriod / totalClassesPeriod) * 100) : 0;

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
    updateClass.mutate({ id, data: { status } });
  };

  const navigatePrevious = () => {
    setCurrentDate(prev => viewMode === "month" ? addMonths(prev, -1) : addWeeks(prev, -1));
  };
  
  const navigateNext = () => {
    setCurrentDate(prev => viewMode === "month" ? addMonths(prev, 1) : addWeeks(prev, 1));
  };
  
  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const currentMonthName = format(currentDate, "MMMM yyyy", { locale: ptBR });
  const formattedMonthName = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  return (
    <div className="flex h-[calc(100vh-3rem)] -m-6 overflow-hidden">
      {/* Sidebar (Aside) */}
      <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0 hidden md:flex">
        <div className="p-4 border-b border-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Modo de Visualização</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setViewMode("month")}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${viewMode === "month" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
            >
              Mensal
            </button>
            <button 
              onClick={() => setViewMode("week")}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${viewMode === "week" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
            >
              Semanal
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Status das Aulas</h3>
            <div className="space-y-2">
              {Object.entries(statusConfig).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2 text-xs text-foreground">
                  <span className={`h-2.5 w-2.5 rounded-full ${val.dot}`} />
                  {val.label}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
              Alunos sem {viewMode === "month" ? "Agenda" : "Agenda"}
              <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px]">{studentsWithoutClasses.length}</span>
            </h3>
            <div className="space-y-2">
              {studentsWithoutClasses.length > 0 ? (
                studentsWithoutClasses.map(student => (
                  <div key={student.id} className="group flex items-center justify-between p-2 rounded-lg border border-border hover:border-primary/50 bg-background transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-foreground">
                        {getInitials(student.name)}
                      </div>
                      <span className="text-xs font-medium text-foreground truncate max-w-[120px]">{student.name}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">Todos alunos receberam aulas.</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-border">
          <div className="rounded-xl gradient-primary p-4 text-white shadow-lg shadow-primary/25">
            <p className="text-xs font-bold mb-1">Progresso {viewMode === "month" ? "no Mês" : "da Semana"}</p>
            <p className="text-[10px] opacity-90 mb-2">{completedClassesPeriod}/{totalClassesPeriod} aulas concluídas</p>
            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all duration-1000 ease-in-out" style={{ width: `${goalProgressPercentage}%`}}></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Calendar Area */}
      <main className="flex-1 flex flex-col bg-background overflow-hidden relative">
        <div className="h-14 flex items-center justify-between px-4 sm:px-6 bg-card border-b border-border shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="text-base sm:text-lg font-bold text-foreground capitalize truncate">{formattedMonthName}</h1>
            <div className="flex items-center bg-secondary rounded-lg p-1">
              <button onClick={navigatePrevious} className="p-1 hover:bg-background rounded-md transition-all text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button 
                onClick={navigateToday}
                className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold hover:bg-background rounded-md transition-all text-foreground"
              >
                Hoje
              </button>
              <button onClick={navigateNext} className="p-1 hover:bg-background rounded-md transition-all text-muted-foreground hover:text-foreground">
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
                showFilters || filters.studentId || filters.status
                ? "bg-primary/10 border-primary text-primary shadow-sm"
                : "border-border text-foreground hover:bg-secondary"
              }`}
            >
              <Filter className="h-3.5 w-3.5" /> 
              <span>Filtrar</span>
              {(filters.studentId || filters.status) && (
                <span className="ml-1 flex h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
            <button className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary transition-colors">
              <Download className="h-3.5 w-3.5" /> Exportar
            </button>
            <button
              onClick={() => setShowNewClass(true)}
              className="flex items-center gap-1 rounded-lg gradient-primary px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-primary/25 hover:opacity-90 sm:ml-2 transition-all"
            >
              <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Nova Aula</span><span className="sm:hidden">Aula</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="bg-card border-b border-border p-4 animate-in slide-in-from-top duration-200">
            <div className="flex flex-wrap items-end gap-4 max-w-4xl mx-auto md:mx-0">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5 ml-1">Filtrar por Aluno</label>
                <select
                  value={filters.studentId}
                  onChange={(e) => setFilters({ ...filters, studentId: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                >
                  <option value="">Todos os Alunos</option>
                  {students?.map(s => (
                    <option key={s.id} value={s.id}>{s.name} {s.active ? "" : "(Inativo)"}</option>
                  ))}
                </select>
              </div>

              <div className="w-48">
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5 ml-1">Status da Aula</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                >
                  <option value="">Todos Status</option>
                  {Object.entries(statusConfig).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              {(filters.studentId || filters.status) && (
                <button
                  onClick={() => setFilters({ studentId: "", status: "" })}
                  className="px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center gap-1"
                >
                  <X className="h-3.5 w-3.5" /> Limpar Filtros
                </button>
              )}
            </div>
          </div>
        )}

        {/* New Class Form Overlay */}
        {showNewClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card rounded-2xl p-6 w-full max-w-lg border border-border shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={() => setShowNewClass(false)}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors"
                title="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground">Agendar Nova Aula</h3>
                  <p className="text-sm text-muted-foreground">Preencha os dados para marcar uma aula.</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">Aluno *</label>
                  <select
                    value={newClass.studentId}
                    onChange={(e) =>
                      setNewClass({ ...newClass, studentId: e.target.value })
                    }
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  >
                    <option value="">Selecione o aluno</option>
                    {students?.filter((s) => s.active).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>

                  {/* Student Schedule Preferences Chips */}
                  {newClass.studentId && (
                    <div className="mt-3">
                      {(() => {
                        const selectedStudent = students?.find(s => s.id === newClass.studentId);
                        const preferences = (selectedStudent as any)?.schedulePreferences || [];
                        
                        if (preferences.length === 0) return null;

                        const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

                        return (
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight ml-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Sugestões de Horário
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {preferences.map((pref: any, idx: number) => {
                                const label = `${dayNames[pref.dayOfWeek]} ${pref.startTime}-${pref.endTime}`;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      const today = new Date();
                                      const targetDate = getDay(today) === pref.dayOfWeek 
                                        ? today 
                                        : nextDay(today, pref.dayOfWeek as any);
                                      
                                      setNewClass(prev => ({
                                        ...prev,
                                        date: format(targetDate, "yyyy-MM-dd"),
                                        startTime: pref.startTime,
                                        endTime: pref.endTime
                                      }));
                                    }}
                                    className="px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-[11px] font-bold transition-all hover:scale-105 active:scale-95"
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">Data *</label>
                    <input
                      type="date"
                      value={newClass.date}
                      onChange={(e) => setNewClass({ ...newClass, date: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-foreground">Início *</label>
                      <input
                        type="time"
                        value={newClass.startTime}
                        onChange={(e) => setNewClass({ ...newClass, startTime: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background px-3 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-foreground">Fim *</label>
                      <input
                        type="time"
                        value={newClass.endTime}
                        onChange={(e) => setNewClass({ ...newClass, endTime: e.target.value })}
                        className="w-full rounded-lg border border-input bg-background px-3 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 mt-2 border-t border-border">
                  <button
                    onClick={handleCreateClass}
                    disabled={!newClass.studentId || !newClass.date || !newClass.startTime || !newClass.endTime}
                    className="flex-1 rounded-xl gradient-primary px-4 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    Agendar Aula
                  </button>
                  <button
                    onClick={() => setShowNewClass(false)}
                    className="flex-1 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-bold text-foreground hover:bg-accent transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto p-4 sm:p-6 custom-scrollbar bg-secondary/10">
          <div className="min-w-[800px] h-full flex flex-col bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-border bg-secondary/50">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 auto-rows-[minmax(120px,1fr)]">
              {daysOfCalendar.map((day, idx) => {
                const key = format(day, "yyyy-MM-dd");
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);
                const dayClasses = classesByDay[key] || [];
                
                return (
                  <div 
                    key={key} 
                    className={`p-2 border-r border-b border-border relative group transition-colors hover:bg-secondary/40
                      ${!isCurrentMonth ? 'bg-secondary/20 text-muted-foreground' : 'bg-transparent'}
                      ${isCurrentDay ? 'bg-primary-[0.03]' : ''}
                      ${(idx + 1) % 7 === 0 ? 'border-r-0' : ''}
                      ${idx >= daysOfCalendar.length - 7 ? 'border-b-0' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-sm font-medium ${isCurrentDay ? 'text-primary font-bold bg-primary/10 rounded-full w-7 h-7 flex items-center justify-center' : 'p-1'}`}>
                        {format(day, "d")}
                      </span>
                      {isCurrentMonth && (
                        <button 
                          onClick={() => {
                            setNewClass(prev => ({ ...prev, date: key }));
                            setShowNewClass(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-primary transition-opacity hover:bg-primary/10 rounded-md"
                          title="Agendar neste dia"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="absolute top-[40px] bottom-2 left-2 right-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-1.5">
                      {dayClasses.map((cls) => {
                        const statusColor = statusConfig[cls.status ?? "SCHEDULED"];
                        
                        return (
                          <div 
                            key={cls.id} 
                            className={`group/item relative rounded-md ${statusColor?.bg} border-l-[3px] ${statusColor?.border} p-2 transition-all hover:brightness-95 flex flex-col gap-1 shadow-sm`}
                          >
                            <div className="flex justify-between items-center">
                              <p className={`text-[10px] sm:text-xs font-bold ${statusColor?.text} ${cls.status === 'CANCELED' ? 'line-through opacity-70' : ''}`}>
                                {cls.startTime}
                              </p>
                              
                              <div className="opacity-0 group-hover/item:opacity-100 flex items-center bg-background/90 backdrop-blur-sm rounded absolute right-1 top-1 bottom-1 px-1 shadow-sm transition-opacity border border-border/50">
                                <select
                                  value={cls.status}
                                  onChange={(e) => handleStatusChange(cls.id, e.target.value as ClassStatus)}
                                  className="h-full py-0 pl-1 pr-6 text-[10px] bg-transparent border-0 focus:ring-0 mr-1 text-foreground cursor-pointer focus:bg-background rounded"
                                  title="Alterar status"
                                >
                                  {Object.entries(statusConfig).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingClassId(cls.id);
                                  }}
                                  className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                                  title="Remover aula"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className={`text-xs truncate font-medium ${!isCurrentMonth || cls.status === 'CANCELED' ? 'text-muted-foreground' : 'text-foreground'}`}>
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
        className="fixed bottom-6 right-6 md:hidden h-14 w-14 rounded-full gradient-primary text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50 focus:outline-none focus:ring-4 focus:ring-primary/30"
        aria-label="Nova Aula"
      >
        <Plus className="h-6 w-6" />
      </button>

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
  );
}
