import { useParams, useNavigate, Link } from "react-router-dom";
import { useStudent } from "./hooks/useStudents";
import { useDeleteClass } from "../classes/hooks/useClasses";
import {
  ChevronRight,
  School,
  User,
  Phone,
  Pencil,
  CreditCard,
  TrendingUp,
  Receipt,
  CalendarDays,
  Filter,
  Download,
  Clock,
  MoreHorizontal,
  ChevronLeft,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  CANCELED: "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20",
  MISSED: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
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
  const deleteClass = useDeleteClass();
  const [activeTab, setActiveTab] = useState<"billing" | "classes">("billing");
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!student) {
    return <p className="text-muted-foreground p-8">Aluno não encontrado.</p>;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const totalClasses = student.classSessions?.length || 0;
  const pendingPayments = student.payments?.filter((p: any) => !p.paid) || [];
  const pendingAmount = pendingPayments.reduce((acc: number, p: any) => acc + p.amount, 0);

  return (
    <div className="flex-1 max-w-[1200px] w-full flex flex-col gap-6">
      {/* Breadcrumb Info */}
      <nav className="flex items-center gap-2 text-sm pt-4">
        <Link to="/students" className="text-muted-foreground hover:text-primary transition-colors">
          Alunos
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-foreground font-medium">Perfil de {student.name}</span>
      </nav>

      {/* Main Profile Info Card */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="bg-primary/5 aspect-square rounded-2xl size-28 shadow-sm border border-border flex items-center justify-center text-primary text-4xl font-black overflow-hidden relative">
              {student.avatarUrl ? (
                <img src={student.avatarUrl} alt={student.name} className="h-full w-full object-cover" />
              ) : (
                getInitials(student.name)
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-foreground text-3xl font-bold tracking-tight">{student.name}</h1>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${student.active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-secondary text-muted-foreground"}`}>
                  {student.active ? "Ativo" : "Inativo"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                  {student.grade || "Série não informada"}
                </span>
                <p className="text-muted-foreground text-sm flex items-center gap-1">
                  <School className="h-3 w-3" />
                  {student.school || "Colégio não informado"}
                </p>
              </div>
              <div className="flex flex-col gap-1 mt-3">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <User className="h-4 w-4" />
                  <span>Responsável: {student.responsibleName || "Não informado"}</span>
                </div>
                {student.responsiblePhone && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Phone className="h-4 w-4" />
                    <span>{student.responsiblePhone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3 h-fit flex-col sm:flex-row">
            <button
              onClick={() => navigate(`/students/${id}/edit`)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-all text-sm"
            >
              <Pencil className="h-5 w-5" />
              Editar Perfil
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg gradient-primary text-white font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition-all text-sm">
              <CreditCard className="h-5 w-5" />
              Adicionar Pagamento
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col gap-1">
          <p className="text-muted-foreground text-sm font-medium">Total de Aulas Dadas</p>
          <div className="flex items-end justify-between">
            <p className="text-foreground text-2xl font-bold tracking-tight">{totalClasses}</p>
            <span className="text-emerald-500 text-sm font-bold flex items-center gap-1">
              +{(totalClasses > 0 ? 1 : 0)} <TrendingUp className="h-4 w-4" />
            </span>
          </div>
        </div>
        
        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col gap-1">
          <p className="text-muted-foreground text-sm font-medium">Pagamentos Pendentes</p>
          <div className="flex items-end justify-between">
            <p className="text-foreground text-2xl font-bold tracking-tight text-primary">
              R$ {pendingAmount.toFixed(2)}
            </p>
            <span className={`${pendingPayments.length > 0 ? "text-amber-500" : "text-emerald-500"} text-sm font-bold`}>
              {pendingPayments.length} Atrasados
            </span>
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col gap-1">
          <p className="text-muted-foreground text-sm font-medium">Taxa de Presença</p>
          <div className="flex items-end justify-between">
            <p className="text-foreground text-2xl font-bold tracking-tight">100%</p>
            <span className="text-emerald-500 text-sm font-bold">Estável</span>
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col gap-1">
          <p className="text-muted-foreground text-sm font-medium">Situação de Mensalidade</p>
          <div className="flex items-end justify-between">
            <p className="text-foreground text-2xl font-bold tracking-tight">R$ {student.monthlyFee?.toFixed(2) || "0.00"}</p>
            <span className="text-muted-foreground text-sm font-bold underline cursor-pointer">Alterar</span>
          </div>
        </div>
      </div>

      {/* Tabs and Content Section */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col min-h-[500px] mb-8">
        <div className="flex border-b border-border px-6 gap-8 bg-secondary/30 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab("billing")}
            className={`relative flex items-center gap-2 py-4 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === "billing" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <Receipt className="h-5 w-5" />
            Histórico de Cobrança
          </button>
          <button 
            onClick={() => setActiveTab("classes")}
            className={`relative flex items-center gap-2 py-4 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === "classes" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <CalendarDays className="h-5 w-5" />
            Log de Aulas
          </button>
        </div>

        <div className="p-6">
          {activeTab === "billing" && (
            <>
              <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <h3 className="text-lg font-bold text-foreground">Faturas Recentes</h3>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors">
                    <Filter className="h-4 w-4" /> Filtrar
                  </button>
                  <button className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors">
                    <Download className="h-4 w-4" /> Exportar PDF
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="text-muted-foreground text-xs font-bold uppercase tracking-wider border-b border-border">
                      <th className="pb-3 px-2">Referência</th>
                      <th className="pb-3 px-2">Data Venc.</th>
                      <th className="pb-3 px-2">Valor</th>
                      <th className="pb-3 px-2">Status</th>
                      <th className="pb-3 px-2 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {student.payments && student.payments.length > 0 ? (
                      student.payments.map((payment: any) => (
                        <tr key={payment.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors group">
                          <td className="py-4 px-2 font-medium text-foreground">Mês {String(payment.month).padStart(2, "0")}/{payment.year}</td>
                          <td className="py-4 px-2 text-muted-foreground">Dia 10</td>
                          <td className="py-4 px-2 font-bold text-foreground">R$ {payment.amount.toFixed(2)}</td>
                          <td className="py-4 px-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${payment.paid ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
                              {payment.paid ? "Pago" : "Pendente"}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <button className="text-muted-foreground hover:text-primary transition-colors">
                              <MoreHorizontal className="h-5 w-5 ml-auto" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">Nenhum histórico de cobrança registrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === "classes" && (
            <>
              <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <h3 className="text-lg font-bold text-foreground">Aulas Registradas</h3>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors">
                    <Filter className="h-4 w-4" /> Filtrar
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="text-muted-foreground text-xs font-bold uppercase tracking-wider border-b border-border">
                      <th className="pb-3 px-2">Data</th>
                      <th className="pb-3 px-2">Horário</th>
                      <th className="pb-3 px-2">Conteúdo</th>
                      <th className="pb-3 px-2">Status</th>
                      <th className="pb-3 px-2 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {student.classSessions && student.classSessions.length > 0 ? (
                      student.classSessions.map((cls: any) => (
                        <tr key={cls.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors group">
                          <td className="py-4 px-2 font-medium text-foreground">
                            {format(new Date(cls.date), "dd/MMM/yyyy", { locale: ptBR })}
                          </td>
                          <td className="py-4 px-2 text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-primary" /> {cls.startTime} - {cls.endTime}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-foreground">{cls.content || "-"}</td>
                          <td className="py-4 px-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[cls.status] || "bg-secondary text-muted-foreground"}`}>
                              {statusLabels[cls.status] || cls.status}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <button
                              onClick={() => {
                                setDeletingClassId(cls.id);
                              }}
                              className="text-muted-foreground hover:text-destructive transition-colors ml-auto p-1"
                              title="Remover aula"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">Nenhum log de aulas registrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Simple Dummy Pagination */}
          {((activeTab === "billing" && student.payments?.length > 0) || (activeTab === "classes" && student.classSessions?.length > 0)) && (
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Exibindo registros recentes
              </p>
              <div className="flex gap-2">
                <button className="p-1 rounded bg-secondary text-muted-foreground cursor-not-allowed" disabled>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="p-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
        title="Remover Aula do Histórico"
        description="Tem certeza que deseja remover esta aula permanentemente? Esta ação não pode ser desfeita."
        confirmLabel="Sim, Remover"
        cancelLabel="Agora não"
        variant="danger"
        icon={Trash2}
      />
    </div>
  );
}
