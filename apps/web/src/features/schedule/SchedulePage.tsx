import { useState, useMemo } from "react";
import {
  useClasses,
  useCreateClass,
  useUpdateClass,
} from "../classes/hooks/useClasses";
import { useStudents } from "../students/hooks/useStudents";
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  eachDayOfInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import type { ClassStatus } from "@tutorfy/types";

const statusConfig: Record<string, { bg: string; label: string }> = {
  SCHEDULED: { bg: "bg-info", label: "Agendada" },
  COMPLETED: { bg: "bg-success", label: "Concluída" },
  CANCELED: { bg: "bg-muted-foreground", label: "Cancelada" },
  MISSED: { bg: "bg-destructive", label: "Faltou" },
};

export function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNewClass, setShowNewClass] = useState(false);
  const [newClass, setNewClass] = useState({
    studentId: "",
    date: "",
    startTime: "",
    endTime: "",
    content: "",
  });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: classes } = useClasses({
    startDate: format(weekStart, "yyyy-MM-dd"),
    endDate: format(weekEnd, "yyyy-MM-dd"),
  });
  const { data: students } = useStudents();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();

  const classesByDay = useMemo(() => {
    const map: Record<string, typeof classes> = {};
    daysOfWeek.forEach((d) => {
      const key = format(d, "yyyy-MM-dd");
      map[key] =
        classes?.filter(
          (c) => format(new Date(c.date), "yyyy-MM-dd") === key,
        ) ?? [];
    });
    return map;
  }, [classes, daysOfWeek]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground">
            Visualização semanal das aulas
          </p>
        </div>
        <button
          onClick={() => setShowNewClass(!showNewClass)}
          className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25"
        >
          {showNewClass ? (
            <X className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {showNewClass ? "Fechar" : "Nova Aula"}
        </button>
      </div>

      {/* New Class Form */}
      {showNewClass && (
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 font-semibold text-foreground">
            Agendar Nova Aula
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <select
              value={newClass.studentId}
              onChange={(e) =>
                setNewClass({ ...newClass, studentId: e.target.value })
              }
              className="rounded-lg border border-input bg-background px-3 py-2.5 text-foreground"
            >
              <option value="">Selecione o aluno</option>
              {students
                ?.filter((s) => s.active)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
            <input
              type="date"
              value={newClass.date}
              onChange={(e) =>
                setNewClass({ ...newClass, date: e.target.value })
              }
              className="rounded-lg border border-input bg-background px-3 py-2.5 text-foreground"
            />
            <input
              type="time"
              value={newClass.startTime}
              onChange={(e) =>
                setNewClass({ ...newClass, startTime: e.target.value })
              }
              className="rounded-lg border border-input bg-background px-3 py-2.5 text-foreground"
            />
            <input
              type="time"
              value={newClass.endTime}
              onChange={(e) =>
                setNewClass({ ...newClass, endTime: e.target.value })
              }
              className="rounded-lg border border-input bg-background px-3 py-2.5 text-foreground"
            />
            <button
              onClick={handleCreateClass}
              className="rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-white"
            >
              Agendar
            </button>
          </div>
        </div>
      )}

      {/* Week Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setCurrentDate(addWeeks(currentDate, -1))}
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold text-foreground">
          {format(weekStart, "dd 'de' MMM", { locale: ptBR })} —{" "}
          {format(weekEnd, "dd 'de' MMM yyyy", { locale: ptBR })}
        </h2>
        <button
          onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 justify-center">
        {Object.entries(statusConfig).map(([key, val]) => (
          <div
            key={key}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span className={`h-2.5 w-2.5 rounded-full ${val.bg}`} />
            {val.label}
          </div>
        ))}
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-7 gap-3">
        {daysOfWeek.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const isToday =
            format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
          const dayClasses = classesByDay[key] || [];

          return (
            <div
              key={key}
              className={`glass rounded-2xl p-4 min-h-[200px] ${isToday ? "ring-2 ring-primary/50" : ""}`}
            >
              <div className="mb-3 text-center">
                <p className="text-xs uppercase text-muted-foreground">
                  {format(day, "EEE", { locale: ptBR })}
                </p>
                <p
                  className={`text-lg font-bold ${isToday ? "text-primary" : "text-foreground"}`}
                >
                  {format(day, "dd")}
                </p>
              </div>

              <div className="space-y-2">
                {dayClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className={`rounded-lg p-2 text-xs border ${
                      cls.status === "COMPLETED"
                        ? "bg-success/10 border-success/20"
                        : cls.status === "SCHEDULED"
                          ? "bg-info/10 border-info/20"
                          : cls.status === "MISSED"
                            ? "bg-destructive/10 border-destructive/20"
                            : "bg-muted border-border"
                    }`}
                  >
                    <p className="font-medium truncate">
                      {(cls as any).student?.name}
                    </p>
                    <p className="text-muted-foreground">{cls.startTime}</p>
                    <select
                      value={cls.status}
                      onChange={(e) =>
                        handleStatusChange(
                          cls.id,
                          e.target.value as ClassStatus,
                        )
                      }
                      className="mt-1 w-full rounded text-xs bg-transparent border-0 p-0 focus:ring-0"
                    >
                      {Object.entries(statusConfig).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
