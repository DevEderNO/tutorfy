import { useParams, useNavigate, Link } from "react-router-dom";
import { useStudent } from "./hooks/useStudents";
import { useDeleteClass } from "../classes/hooks/useClasses";
import { ChevronRight, User, Phone, Pencil, CreditCard, TrendingUp, Receipt, CalendarDays, Filter, Download, Clock, MoreHorizontal, ChevronLeft, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Header } from "@/components/layout/Header";
import { EvolutionTab } from "./components/EvolutionTab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from "@/components/ui/table";

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
  const [activeTab, setActiveTab] = useState<"evolution" | "classes" | "billing">("evolution");
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
    <div className="flex flex-col min-h-screen">
      <Header
        title={`Perfil: ${student.name}`}
        actions={
          <div className="flex items-center gap-3 mr-2">
            <Link to={`/students/${id}/edit`} className="glass p-2.5 rounded-xl text-primary hover:text-white transition-colors" title="Editar Aluno">
              <Pencil className="h-5 w-5" />
            </Link>
          </div>
        }
      />

      <div className="flex-1 max-w-[1200px] w-full mx-auto p-8 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Main Profile Info Card */}
        <div className="glass-panel rounded-xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none"></div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <div className="relative">
                <div className="size-32 rounded-3xl bg-gradient-to-br from-primary to-purple-800 p-1 neon-shadow">
                  <div className="w-full h-full rounded-[1.4rem] bg-background flex items-center justify-center overflow-hidden">
                    {student.avatarUrl ? <img src={student.avatarUrl} alt={student.name} className="h-full w-full object-cover" /> : <span className="text-primary text-4xl font-black">{getInitials(student.name)}</span>}
                  </div>
                </div>
                <div
                  className={`absolute -bottom-2 -right-2 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border-2 border-background ${student.active ? "bg-emerald-500 neon-text-emerald" : "bg-slate-500"}`}
                >
                  {student.active ? "Ativo" : "Inativo"}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-2xl font-bold text-slate-100 mb-1 tracking-tight">{student.name}</h1>
                <p className="text-slate-400 text-lg mb-2">
                  {student.grade || "Série não informada"} • {student.school || "Colégio não informado"}
                </p>
                <div className="flex flex-wrap gap-4 text-sm items-center justify-center md:justify-start">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-panel text-slate-300">
                    <User className="h-4 w-4 text-primary" />
                    <span>Responsável: {student.responsibleName || "Não informado"}</span>
                  </div>
                  {student.responsiblePhone && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-panel text-slate-300">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{student.responsiblePhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Button variant="secondary" onClick={() => navigate(`/students/${id}/edit`)}>
                <Pencil className="h-4 w-4" />
                Editar Perfil
              </Button>
              <Button variant="primary">
                <CreditCard className="h-4 w-4" />
                Adicionar Pagamento
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel rounded-xl p-6 border-l-4 border-l-primary hover:translate-y-[-4px] transition-transform">
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Aulas Dadas</p>
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-2xl font-bold text-slate-100">{totalClasses}</p>
              <p className="text-emerald-400 text-xs font-bold">+{totalClasses > 0 ? 1 : 0} este mês</p>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6 border-l-4 border-l-purple-500 hover:translate-y-[-4px] transition-transform">
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Pendentes</p>
              <Receipt className="h-5 w-5 text-purple-500" />
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-2xl font-bold text-purple-400">R$ {pendingAmount.toFixed(2)}</p>
              <p className="text-slate-500 text-xs">{pendingPayments.length} Atrasados</p>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6 border-l-4 border-l-emerald-500 hover:translate-y-[-4px] transition-transform">
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Presença</p>
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-2xl font-bold text-slate-100">100%</p>
              <p className="text-slate-500 text-xs">Total impecável</p>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6 border-l-4 border-l-blue-500 hover:translate-y-[-4px] transition-transform">
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Mensalidade</p>
              <CreditCard className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-2xl font-bold text-slate-100 italic">R$ {student.monthlyFee?.toFixed(2) || "0.00"}</p>
              <p className="text-slate-500 text-xs underline cursor-pointer hover:text-slate-300">Alterar Plano</p>
            </div>
          </div>
        </div>

        {/* Tabs and Content Section */}
        <div className="glass-panel rounded-xl overflow-hidden flex flex-col min-h-[500px] mb-8 relative z-10">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "evolution" | "billing" | "classes")}
            variant="underline"
            className="relative z-20"
          >
            <TabsList className="w-full px-6 gap-6 bg-white/5 border-b border-white/10 rounded-none overflow-x-auto hide-scrollbar">
              <TabsTrigger value="evolution" className="py-4 font-bold">
                <TrendingUp className="h-5 w-5" />
                Evolução
              </TabsTrigger>
              <TabsTrigger value="billing" className="py-4 font-bold">
                <Receipt className="h-5 w-5" />
                Histórico de Cobrança
              </TabsTrigger>
              <TabsTrigger value="classes" className="py-4 font-bold">
                <CalendarDays className="h-5 w-5" />
                Log de Aulas
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="p-6 relative z-20">
            {activeTab === "billing" && (
              <>
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-primary" />
                    Faturas Recentes
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm">
                      <Filter className="h-4 w-4" /> Filtrar
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Download className="h-4 w-4" /> Exportar PDF
                    </Button>
                  </div>
                </div>

                <Table variant="ghost">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mês/Ano</TableHead>
                      <TableHead>Data Venc.</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.payments && student.payments.length > 0 ? (
                      student.payments.map((payment: { id: string; month: number; year: number; amount: number; paid: boolean }) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium text-slate-100">
                            Mês {String(payment.month).padStart(2, "0")}/{payment.year}
                          </TableCell>
                          <TableCell className="text-slate-400">Dia 10</TableCell>
                          <TableCell className="font-bold text-slate-100">R$ {payment.amount.toFixed(2)}</TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${payment.paid ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}
                            >
                              <span className={`size-1.5 rounded-full ${payment.paid ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                              {payment.paid ? "Pago" : "Pendente"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon-sm" aria-label="Mais ações relativas à fatura" className="ml-auto">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableEmpty colSpan={5} message="Nenhum histórico de cobrança registrado." />
                    )}
                  </TableBody>
                </Table>
              </>
            )}

            {activeTab === "classes" && (
              <>
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Aulas Registradas
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm">
                      <Filter className="h-4 w-4" /> Filtrar
                    </Button>
                  </div>
                </div>

                <Table variant="ghost">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Conteúdo</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.classSessions && student.classSessions.length > 0 ? (
                      student.classSessions.map((cls: { id: string; date: string; startTime: string; endTime: string; content?: string; status: string }) => (
                        <TableRow key={cls.id}>
                          <TableCell className="font-medium text-slate-100">
                            {format(new Date(cls.date), "dd/MMM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4 text-primary" /> {cls.startTime} - {cls.endTime}
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-300">{cls.content || "-"}</TableCell>
                          <TableCell className="text-center">
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[cls.status] || "bg-slate-500/10 text-slate-500 border-slate-500/20"}`}>
                              {statusLabels[cls.status] || cls.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeletingClassId(cls.id)}
                              aria-label="Remover aula"
                              className="ml-auto hover:text-red-400 hover:bg-red-400/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableEmpty colSpan={5} message="Nenhum log de aulas registrado." />
                    )}
                  </TableBody>
                </Table>
              </>
            )}

            {activeTab === "evolution" && id && <EvolutionTab studentId={id} />}

            {/* Simple Dummy Pagination */}
            {((activeTab === "billing" && student.payments?.length > 0) || (activeTab === "classes" && student.classSessions?.length > 0)) && (
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/10 bg-white/5 px-6 -mx-6 -mb-6 pb-6">
                <p className="text-sm text-slate-500">Exibindo registros recentes</p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon-sm" disabled aria-label="Página anterior">
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button variant="secondary" size="icon-sm" aria-label="Página 1" className="bg-primary/20 border-primary/30 text-foreground">1</Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Próxima página">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
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
    </div>
  );
}
