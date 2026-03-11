import { useState } from "react";
import {
  usePayments,
  useGeneratePayments,
  useMarkPaid,
  useCreatePayment,
  useDeletePayment,
} from "../payments/hooks/usePayments";
import { useStudents } from "../students/hooks/useStudents";
import {
  DollarSign,
  Plus,
  Check,
  Trash2,
  CalendarDays,
  Filter,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Modal } from "@/components/Modal";
import { Header } from "@/components/layout/Header";

export function FinancialPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showGenerate, setShowGenerate] = useState(false);
  const [showManual, setShowManual] = useState(false);

  // Custom filter state added for new UI tabs
  const [activeTab, setActiveTab] = useState<"MONTHLY" | "HOURLY">("MONTHLY");

  const [manualForm, setManualForm] = useState({
    studentId: "",
    billingType: "MONTHLY" as "MONTHLY" | "HOURLY",
    amount: 0,
    classHours: 0,
  });
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(
    null,
  );

  const { data: payments, isLoading } = usePayments({ month, year });
  const { data: students } = useStudents();
  const markPaid = useMarkPaid();
  const generatePayments = useGeneratePayments();
  const createPayment = useCreatePayment();
  const deletePayment = useDeletePayment();

  const handleTogglePaid = (id: string, currentPaid: boolean) => {
    markPaid.mutate({ id, paid: !currentPaid });
  };

  const handleGeneratePayments = async () => {
    await generatePayments.mutateAsync({ month, year });
    setShowGenerate(false);
  };

  const handleManualSubmit = async () => {
    if (!manualForm.studentId) return;

    let finalAmount = manualForm.amount;
    let finalClassHours = undefined;

    if (manualForm.billingType === "HOURLY") {
      const student = students?.find((s) => s.id === manualForm.studentId);
      const rate = student?.hourlyRate || 0;
      finalAmount = manualForm.classHours * rate;
      finalClassHours = manualForm.classHours;
    }

    await createPayment.mutateAsync({
      studentId: manualForm.studentId,
      month,
      year,
      amount: finalAmount,
      billingType: manualForm.billingType,
      classHours: finalClassHours,
    });

    setShowManual(false);
    setManualForm({
      studentId: "",
      billingType: "MONTHLY",
      amount: 0,
      classHours: 0,
    });
  };

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  // Global counts and sums
  const paidCount = payments?.filter((p) => p.paid).length ?? 0;
  const pendingCount = payments?.filter((p) => !p.paid).length ?? 0;

  const totalReceived =
    payments?.filter((p) => p.paid).reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const totalPending =
    payments?.filter((p) => !p.paid).reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const totalExpected = totalReceived + totalPending;

  const collectionRate =
    payments && payments.length > 0
      ? Math.round((paidCount / payments.length) * 100)
      : 0;

  // Filter payments by active tab
  const filteredPayments = payments?.filter((p) => p.billingType === activeTab);

  // Avatar colors
  const avatarColors = [
    "bg-primary/10 text-primary",
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Financeiro"
        searchPlaceholder="Filtrar por aluno ou movimentação..."
        onSearchChange={() => {}} // TODO: Implement if needed
        actions={
          <div className="flex items-center gap-4 mr-2">
            <div className="flex items-center gap-2 glass p-1 rounded-xl">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="bg-transparent border-none text-xs font-bold text-slate-200 focus:ring-0 outline-none px-2 cursor-pointer"
              >
                {months.map((m, i) => (
                  <option key={m} value={i + 1} className="bg-slate-900">
                    {m}
                  </option>
                ))}
              </select>
              <div className="w-px h-4 bg-white/10" />
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="bg-transparent border-none text-xs font-bold text-slate-200 focus:ring-0 outline-none px-2 cursor-pointer"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y} className="bg-slate-900">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowGenerate(true)}
              className="glass p-2.5 rounded-xl text-primary hover:bg-primary/10 transition-colors flex items-center gap-2 font-bold text-xs"
              title="Gerar Mensalidades"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Gerar</span>
            </button>
            <button
              onClick={() => setShowManual(true)}
              className="gradient-primary text-white p-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 flex items-center gap-2 font-bold text-xs"
              title="Lançamento Avulso"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Avulso</span>
            </button>
          </div>
        }
      />

      <div className="flex-1 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col lg:flex-row gap-8 overflow-hidden h-full">
          {/* Sidebar Metrics */}
          <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6 overflow-y-auto pr-1 pb-4">
            <div className="glass-panel rounded-xl border border-white/10 p-6 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none"></div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Resumo Financeiro
              </p>
              <div className="flex flex-col">
                <h3 className="text-3xl font-black text-foreground">
                  R$ {totalReceived.toFixed(2)}
                </h3>
                <span className="text-sm font-medium text-muted-foreground mt-1">
                  de R$ {totalExpected.toFixed(2)} esperados
                </span>
              </div>

              <div className="mt-2 text-sm font-bold bg-primary/20 text-primary px-3 py-1.5 rounded-full w-fit shadow-[0_0_15px_rgba(116,61,245,0.3)] border border-primary/20 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Recebido: {collectionRate}%
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(116,61,245,0.3)] transition-all duration-500"
                  style={{ width: `${collectionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="glass-panel rounded-xl border border-white/10 p-6 flex flex-col gap-4">
              <h4 className="font-bold text-foreground text-sm uppercase tracking-widest">
                Status de Mensalidades
              </h4>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>{" "}
                      Pagos ({paidCount})
                    </span>
                    <span className="font-bold text-emerald-400">
                      R$ {totalReceived.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-500"
                      style={{ width: `${collectionRate}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>{" "}
                      Pendentes ({pendingCount})
                    </span>
                    <span className="font-bold text-amber-400">
                      R$ {totalPending.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-500"
                      style={{
                        width: `${payments && payments.length > 0 ? (pendingCount / payments.length) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate / Manual Blocks */}
            <div className="flex flex-col gap-3 mt-auto border-t border-border pt-6">
              <button
                onClick={() => setShowManual(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 glass-panel px-4 py-3.5 text-sm font-bold text-foreground hover:bg-white/5 transition-all shadow-sm group"
              >
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                Lançamento Avulso
              </button>
            </div>
          </aside>

          {/* Main Content View */}
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto pb-8 pr-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-black leading-tight tracking-tight text-foreground">
                  Faturamento Automatizado
                </h2>
                <p className="text-muted-foreground text-sm font-medium">
                  Gestão financeira inteligente Tutorfy
                </p>
              </div>

              <button
                onClick={() => setShowGenerate(true)}
                className="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-[0_0_15px_rgba(116,61,245,0.4)] hover:opacity-90 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
              >
                <Sparkles className="h-5 w-5" />
                <span>Gerar Faturas do Mês</span>
              </button>
            </div>

            {/* Filters Bar */}
            <section className="glass-panel rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 border border-white/10">
              <div className="flex items-center p-1 bg-black/20 dark:bg-white/5 rounded-lg border border-white/5 w-full lg:w-auto overflow-x-auto">
                <button
                  onClick={() => setActiveTab("MONTHLY")}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap flex-1 lg:flex-none ${
                    activeTab === "MONTHLY"
                      ? "bg-white/10 text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  Mensalidade Fixa
                </button>
                <button
                  onClick={() => setActiveTab("HOURLY")}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap flex-1 lg:flex-none ${
                    activeTab === "HOURLY"
                      ? "bg-white/10 text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  Valor por Hora
                </button>
              </div>

              <div className="flex gap-4 w-full lg:w-auto items-center justify-end">
                <div className="relative w-full lg:w-auto">
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full lg:w-auto appearance-none bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary focus:outline-none backdrop-blur-md pr-10 cursor-pointer"
                    aria-label="Mês"
                    title="Mês"
                  >
                    {months.map((m, i) => (
                      <option key={i} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                <div className="relative w-full lg:w-auto">
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full lg:w-auto appearance-none bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary focus:outline-none backdrop-blur-md pr-10 cursor-pointer"
                    aria-label="Ano"
                    title="Ano"
                  >
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </section>

            {/* Dynamic Payment Table */}
            <div className="glass-panel rounded-2xl border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="text-lg font-bold text-foreground">
                  {activeTab === "MONTHLY"
                    ? "Lançamentos: Mensalidade Fixa"
                    : "Lançamentos: Valor por Hora"}
                </h3>
                <span className="text-xs font-bold px-3 py-1 bg-white/10 text-muted-foreground rounded-full border border-white/5">
                  {filteredPayments?.length || 0} Registros
                </span>
              </div>

              {isLoading ? (
                <div className="flex h-32 items-center justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : !filteredPayments || filteredPayments.length === 0 ? (
                <div className="p-12 text-center">
                  <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-medium">
                    Nenhum pagamento registrado nesta categoria.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tente alterar os filtros de mês ou gerar faturas do mês.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-muted-foreground text-xs font-bold uppercase tracking-widest border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4 whitespace-nowrap truncate min-w-[200px]">
                          Aluno
                        </th>
                        <th className="px-6 py-4 whitespace-nowrap truncate">
                          Detalhes
                        </th>
                        <th className="px-6 py-4 whitespace-nowrap truncate min-w-[120px]">
                          Valor Total
                        </th>
                        <th className="px-6 py-4 whitespace-nowrap truncate">
                          Status
                        </th>
                        <th className="px-6 py-4 text-right whitespace-nowrap truncate min-w-[150px]">
                          Ação
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredPayments.map((payment, idx) => {
                        const studentName =
                          (payment as any).student?.name || "Desconhecido";
                        const initial = getInitials(studentName);
                        const colorClass =
                          avatarColors[idx % avatarColors.length];

                        return (
                          <tr
                            key={payment.id}
                            className="hover:bg-white/[0.02] transition-colors group"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`size-10 shrink-0 rounded-full flex items-center justify-center font-bold text-xs ${colorClass} border border-white/10 shadow-sm`}
                                >
                                  {initial}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <p className="text-sm font-bold text-foreground truncate max-w-[140px] md:max-w-[200px]">
                                    {studentName}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate max-w-[140px] md:max-w-[200px]">
                                    {(payment as any).student?.school ||
                                      "Sem escola"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              {activeTab === "HOURLY" ? (
                                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap truncate">
                                  {payment.classHours} hrs x R$
                                  {(
                                    payment as any
                                  ).student?.hourlyRate?.toFixed(2) || "0.00"}
                                </span>
                              ) : (
                                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap truncate">
                                  Mês de Referência {payment.month}/
                                  {payment.year}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-sm font-bold text-foreground whitespace-nowrap truncate">
                                R$ {payment.amount.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                                  payment.paid
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                                }`}
                              >
                                {payment.paid ? "Pago" : "Pendente"}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() =>
                                    handleTogglePaid(payment.id, payment.paid)
                                  }
                                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap truncate ${
                                    payment.paid
                                      ? "text-muted-foreground hover:bg-white/10"
                                      : "text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20"
                                  }`}
                                >
                                  {payment.paid ? "Desfazer" : "Marcar Pago"}
                                </button>
                                <button
                                  onClick={() => {
                                    setDeletingPaymentId(payment.id);
                                  }}
                                  className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors shrink-0"
                                  title="Apagar"
                                  aria-label="Apagar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Summary of Recent Invoices Visual */}
            <div className="flex flex-col gap-4 mt-2">
              <h3 className="text-xl font-bold text-foreground tracking-tight">
                Visão Resumida do Mês
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="glass-panel p-5 rounded-xl border border-white/10 shadow-sm flex flex-col gap-3 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">
                        Status
                      </span>
                      <span className="px-2 py-0.5 rounded-full border border-emerald-500/20 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 uppercase w-fit">
                        Pagos Total
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-2 relative z-10">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Valor Acumulado
                      </span>
                      <span className="text-2xl font-black text-foreground mt-0.5">
                        R$ {totalReceived.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-xl border border-white/10 shadow-sm flex flex-col gap-3 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full -mr-4 -mt-4 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">
                        Status
                      </span>
                      <span className="px-2 py-0.5 rounded-full border border-amber-500/20 text-[10px] font-bold bg-amber-500/10 text-amber-400 uppercase w-fit">
                        Pendentes Total
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-2 relative z-10">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Valor a Receber
                      </span>
                      <span className="text-2xl font-black text-foreground mt-0.5">
                        R$ {totalPending.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(116,61,245,0.1)] flex flex-col gap-3 relative overflow-hidden border-dashed group hover:border-primary/50 transition-colors">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full -mr-4 -mt-4 blur-xl group-hover:bg-primary/20 transition-colors duration-500"></div>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">
                        Projeção
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        Total do Mês
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-2 relative z-10">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Soma Máxima
                      </span>
                      <span className="text-2xl font-black text-primary mt-0.5">
                        R$ {totalExpected.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Manual Payment MODAL Form */}
          <Modal
            isOpen={showManual}
            onClose={() => setShowManual(false)}
            title="Novo Lançamento"
            size="lg"
          >
            <p className="text-slate-400 text-sm mb-6 font-medium -mt-2">
              {months[month - 1]}/{year} — Preencha os dados para registrar uma entrada financeira avulsa.
            </p>

            <div className="flex flex-col gap-5">
              <div>
                <label className="mb-2 block text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Aluno *
                </label>
                <select
                  title="Aluno"
                  aria-label="Aluno"
                  value={manualForm.studentId}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, studentId: e.target.value })
                  }
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-slate-200 transition-all font-medium outline-none"
                >
                  <option value="" className="bg-slate-900">
                    Selecione um aluno...
                  </option>
                  {students?.filter((s) => s.active).map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Tipo de Cobrança *
                </label>
                <select
                  title="Tipo de Cobrança"
                  aria-label="Tipo de Cobrança"
                  value={manualForm.billingType}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, billingType: e.target.value as any })
                  }
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-slate-200 transition-all font-medium outline-none"
                >
                  <option value="MONTHLY" className="bg-slate-900">Mensalidade Fixa</option>
                  <option value="HOURLY" className="bg-slate-900">Por Hora-Aula</option>
                </select>
              </div>

              {manualForm.billingType === "HOURLY" ? (
                <div>
                  <label className="mb-2 block text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                    Quantidade de Horas *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={manualForm.classHours || ""}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, classHours: Number(e.target.value) })
                    }
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm text-slate-200 transition-all font-medium outline-none"
                    placeholder="Ex: 10"
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                    Valor Calculado (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={manualForm.amount || ""}
                      onChange={(e) =>
                        setManualForm({ ...manualForm, amount: Number(e.target.value) })
                      }
                      className="w-full pl-12 pr-4 glass-input rounded-xl py-3 text-lg font-bold text-slate-200 outline-none transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowManual(false)}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-slate-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualForm.studentId}
                  className="w-full bg-primary py-3.5 rounded-xl text-white font-bold text-sm neon-glow hover:brightness-110 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  Lançar Pagamento
                </button>
              </div>
            </div>
          </Modal>

          {/* Generate Confirmation MODAL */}
          <Modal
            isOpen={showGenerate}
            onClose={() => setShowGenerate(false)}
            title="Gerar Mensalidades"
            size="md"
          >
            <div className="flex flex-col items-center text-center gap-6">
              <div className="size-16 bg-primary/20 text-primary border border-primary/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(116,61,245,0.3)]">
                <Sparkles className="h-8 w-8" />
              </div>

              <p className="text-slate-400 text-sm font-medium">
                Todas as faturas pendentes do mês de{" "}
                <strong className="text-white">
                  {months[month - 1]} de {year}
                </strong>{" "}
                para alunos ativos (Mensalidade e Por Hora) serão geradas no sistema.
              </p>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={() => setShowGenerate(false)}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-slate-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGeneratePayments}
                  className="w-full bg-primary py-3.5 rounded-xl text-white font-bold text-sm neon-glow hover:brightness-110 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </Modal>

          {/* Confirmation Modals */}
          <ConfirmModal
            isOpen={!!deletingPaymentId}
            onClose={() => setDeletingPaymentId(null)}
            onConfirm={() => {
              if (deletingPaymentId) {
                deletePayment.mutate(deletingPaymentId);
                setDeletingPaymentId(null);
              }
            }}
            title="Remover Lançamento"
            description="Tem certeza que deseja apagar este lançamento financeiro? Esta ação não pode ser desfeita."
            confirmLabel="Sim, Remover"
            cancelLabel="Agora não"
            variant="danger"
            icon={Trash2}
          />
        </div>
      </div>
    </div>
  );
}
