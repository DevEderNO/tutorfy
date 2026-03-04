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
  GripVertical
} from "lucide-react";
import type { ClassStatus } from "@tutorfy/types";

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

  const classesByDay = useMemo(() => {
    const map: Record<string, typeof classes> = {};
    daysOfCalendar.forEach((d) => {
      const key = format(d, "yyyy-MM-dd");
      map[key] =
        classes?.filter(
          (c) => format(new Date(c.date), "yyyy-MM-dd") === key,
        )?.sort((a, b) => a.startTime.localeCompare(b.startTime)) ?? [];
    });
    return map;
  }, [classes, daysOfCalendar]);

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
  // Capitalize first letter properly
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
              Alunos sem Agendamento
              <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px]">2</span>
            </h3>
            <div className="space-y-2">
              <div className="group flex items-center justify-between p-2 rounded-lg border border-border hover:border-primary/50 cursor-move bg-background transition-colors">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-foreground">JS</div>
                  <span className="text-xs font-medium text-foreground">Jane Smith</span>
                </div>
                <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="group flex items-center justify-between p-2 rounded-lg border border-border hover:border-primary/50 cursor-move bg-background transition-colors">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-foreground">MR</div>
                  <span className="text-xs font-medium text-foreground">Mike Ross</span>
                </div>
                <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Tarefas Pendentes</h3>
            <div className="space-y-3">
              <label className="flex gap-2 cursor-pointer group">
                <input type="checkbox" className="rounded border-input text-primary focus:ring-primary mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">Preparar quiz de Cálculo</span>
                  <span className="text-[10px] text-muted-foreground italic">Para amanhã</span>
                </div>
              </label>
              <label className="flex gap-2 cursor-pointer group">
                <input type="checkbox" className="rounded border-input text-primary focus:ring-primary mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">Corrigir prova de Física</span>
                  <span className="text-[10px] text-destructive italic">Atrasado</span>
                </div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-border">
          <div className="rounded-xl gradient-primary p-4 text-white shadow-lg shadow-primary/25">
            <p className="text-xs font-bold mb-1">Meta Semanal</p>
            <p className="text-[10px] opacity-90 mb-2">18/25 aulas concluídas</p>
            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-[72%] transition-all duration-1000 ease-in-out"></div>
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
            <button className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary transition-colors">
              <Filter className="h-3.5 w-3.5" /> Filtrar
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

        {/* New Class Form Overlay */}
        {showNewClass && (
          <div className="absolute top-14 left-0 right-0 z-10 bg-card border-b border-border p-4 shadow-lg animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Agendar Nova Aula</h3>
              <button onClick={() => setShowNewClass(false)} className="text-muted-foreground hover:text-destructive transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <select
                value={newClass.studentId}
                onChange={(e) =>
                  setNewClass({ ...newClass, studentId: e.target.value })
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors hover:border-border/80"
              >
                <option value="">Selecione o aluno</option>
                {students?.filter((s) => s.active).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <input
                type="date"
                value={newClass.date}
                onChange={(e) => setNewClass({ ...newClass, date: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors hover:border-border/80"
              />
              <input
                type="time"
                value={newClass.startTime}
                onChange={(e) => setNewClass({ ...newClass, startTime: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors hover:border-border/80"
              />
              <input
                type="time"
                value={newClass.endTime}
                onChange={(e) => setNewClass({ ...newClass, endTime: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors hover:border-border/80"
              />
              <button
                onClick={handleCreateClass}
                className="w-full rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/25 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Agendar
              </button>
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
                                    if (window.confirm("Tem certeza que deseja remover esta aula?")) deleteClass.mutate(cls.id);
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
    </div>
  );
}
