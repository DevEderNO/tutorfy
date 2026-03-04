import { useDashboard } from "./hooks/useDashboard";
import { Users, CalendarDays, DollarSign, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-info/10 text-info border-info/20",
  COMPLETED: "bg-success/10 text-success border-success/20",
  CANCELED: "bg-muted text-muted-foreground border-border",
  MISSED: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels: Record<string, string> = {
  SCHEDULED: "Agendada",
  COMPLETED: "Concluída",
  CANCELED: "Cancelada",
  MISSED: "Faltou",
};

export function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const cards = [
    {
      title: "Alunos Ativos",
      value: data?.activeStudents ?? 0,
      icon: Users,
      gradient: "gradient-primary",
      shadow: "shadow-primary/20",
    },
    {
      title: "Aulas da Semana",
      value: data?.weekClasses.length ?? 0,
      icon: CalendarDays,
      gradient: "gradient-info",
      shadow: "shadow-info/20",
    },
    {
      title: "Pagamentos Pendentes",
      value: data?.pendingPayments ?? 0,
      icon: DollarSign,
      gradient: "gradient-warning",
      shadow: "shadow-warning/20",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu dia</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="glass rounded-2xl p-6 transition-transform hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {card.value}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.gradient} shadow-lg ${card.shadow}`}
              >
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next Class */}
      {data?.nextClass && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Próxima Aula
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary text-white">
              <span className="text-lg font-bold">
                {format(new Date(data.nextClass.date), "dd")}
              </span>
            </div>
            <div>
              <p className="font-medium text-foreground">
                {(data.nextClass as any).student?.name || "Aluno"}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(data.nextClass.date), "EEEE, dd 'de' MMMM", {
                  locale: ptBR,
                })}{" "}
                • {data.nextClass.startTime} - {data.nextClass.endTime}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Week Classes */}
      {data?.weekClasses && data.weekClasses.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Aulas da Semana
          </h2>
          <div className="space-y-3">
            {data.weekClasses.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between rounded-xl bg-background/50 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(cls.date), "EEE", { locale: ptBR })}
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {format(new Date(cls.date), "dd")}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {(cls as any).student?.name || "Aluno"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {cls.startTime} - {cls.endTime}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${statusColors[cls.status]}`}
                >
                  {statusLabels[cls.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
