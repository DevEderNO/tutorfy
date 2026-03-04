import { useParams, useNavigate } from "react-router-dom";
import { useStudent } from "./hooks/useStudents";
import { ArrowLeft, Pencil, CalendarDays, DollarSign } from "lucide-react";
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

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: student, isLoading } = useStudent(id);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!student) {
    return <p className="text-muted-foreground">Aluno não encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/students")}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {student.name}
            </h1>
            <p className="text-muted-foreground">
              {student.school} • {student.grade}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/students/${id}/edit`)}
          className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          <Pencil className="h-4 w-4" />
          Editar
        </button>
      </div>

      {/* Student Info */}
      <div className="glass rounded-2xl p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Responsável</p>
            <p className="font-medium text-foreground">
              {student.responsibleName}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Telefone</p>
            <p className="font-medium text-foreground">
              {student.responsiblePhone}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mensalidade</p>
            <p className="font-medium text-foreground">
              R$ {student.monthlyFee.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p
              className={`font-medium ${student.active ? "text-success" : "text-muted-foreground"}`}
            >
              {student.active ? "Ativo" : "Inativo"}
            </p>
          </div>
        </div>
      </div>

      {/* Classes History */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Histórico de Aulas
          </h2>
        </div>
        {student.classSessions && student.classSessions.length > 0 ? (
          <div className="space-y-3">
            {student.classSessions.map((cls: any) => (
              <div
                key={cls.id}
                className="flex items-center justify-between rounded-xl bg-background/50 p-4"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {format(new Date(cls.date), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {cls.startTime} - {cls.endTime}
                    {cls.content && ` • ${cls.content}`}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${statusColors[cls.status]}`}
                >
                  {statusLabels[cls.status]}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Nenhuma aula registrada.
          </p>
        )}
      </div>

      {/* Payments History */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Histórico de Pagamentos
          </h2>
        </div>
        {student.payments && student.payments.length > 0 ? (
          <div className="space-y-3">
            {student.payments.map((payment: any) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-xl bg-background/50 p-4"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {String(payment.month).padStart(2, "0")}/{payment.year}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    R$ {payment.amount.toFixed(2)}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    payment.paid
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-warning/10 text-warning border-warning/20"
                  }`}
                >
                  {payment.paid ? "Pago" : "Pendente"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Nenhum pagamento registrado.
          </p>
        )}
      </div>
    </div>
  );
}
