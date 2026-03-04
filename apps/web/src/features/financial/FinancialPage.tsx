import { useState } from "react";
import {
  usePayments,
  useGeneratePayments,
  useMarkPaid,
  useCreatePayment,
  useDeletePayment,
} from "../payments/hooks/usePayments";
import { useStudents } from "../students/hooks/useStudents";
import { DollarSign, Plus, Check, X as XIcon, Trash2, CalendarDays, Filter, TrendingUp, Sparkles } from "lucide-react";
import { getInitials } from "@/lib/utils";

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
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  // Global counts and sums
  const paidCount = payments?.filter((p) => p.paid).length ?? 0;
  const pendingCount = payments?.filter((p) => !p.paid).length ?? 0;
  
  const totalReceived =
    payments?.filter((p) => p.paid).reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const totalPending =
    payments?.filter((p) => !p.paid).reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const totalExpected = totalReceived + totalPending;

  const collectionRate = payments && payments.length > 0
    ? Math.round((paidCount / payments.length) * 100)
    : 0;

  // Filter payments by active tab
  const filteredPayments = payments?.filter(p => p.billingType === activeTab);

  // Avatar colors
  const avatarColors = [
    "bg-primary/10 text-primary",
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
  ];

  return (
    <div className="flex flex-1 flex-col lg:flex-row gap-8 overflow-hidden h-full">
      {/* Sidebar Metrics */}
      <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col gap-2">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Resumo Financeiro</p>
          <h3 className="text-3xl font-black text-foreground">
            R$ {totalReceived.toFixed(2)}
            <span className="text-sm font-medium text-muted-foreground block mt-1">/ R$ {totalExpected.toFixed(2)} esperados</span>
          </h3>
          <div className="flex items-center gap-2 mt-2 text-sm text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full w-fit">
            <TrendingUp className="h-4 w-4" />
            Taxa de recebimento: {collectionRate}%
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h4 className="font-bold text-foreground mb-4">Status de Pagamentos</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Recebidos ({paidCount})
              </span>
              <span className="font-bold text-foreground">R$ {totalReceived.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div> Pendentes ({pendingCount})
              </span>
              <span className="font-bold text-foreground">R$ {totalPending.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="w-full bg-secondary h-1.5 rounded-full mt-4">
            <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${collectionRate}%` }}></div>
          </div>
        </div>

        {/* Generate / Manual Blocks */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setShowManual(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Lançamento Avulso
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto pb-8 pr-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black leading-tight tracking-tight text-foreground">
              Faturamento Automatizado
            </h2>
            <p className="text-muted-foreground text-sm">
              Gerencie faturas e pagamentos de seus alunos.
            </p>
          </div>
          
          <button
            onClick={() => setShowGenerate(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
          >
            <Sparkles className="h-5 w-5" />
            <span>Gerar Faturas do Mês</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm gap-4">
          <div className="flex gap-2 p-1 bg-secondary rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("HOURLY")}
              className={`px-6 py-2 rounded-md text-sm font-semibold transition-all flex-1 sm:flex-none ${
                activeTab === "HOURLY"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Valor por Hora
            </button>
            <button
              onClick={() => setActiveTab("MONTHLY")}
              className={`px-6 py-2 rounded-md text-sm font-semibold transition-all flex-1 sm:flex-none ${
                activeTab === "MONTHLY"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mensalidade Fixa
            </button>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto items-center justify-end">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="bg-transparent border-none text-sm font-medium text-foreground focus:ring-0 cursor-pointer pr-1"
                aria-label="Mês"
                title="Mês"
              >
                {months.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="bg-transparent border-none text-sm font-medium text-muted-foreground focus:ring-0 cursor-pointer"
                aria-label="Ano"
                title="Ano"
              >
                 {[2024, 2025, 2026, 2027].map((y) => (
                   <option key={y} value={y}>{y}</option>
                 ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Payment Table */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-card">
            <h3 className="text-lg font-bold text-foreground">
              {activeTab === "MONTHLY" ? "Lançamentos: Mensalidade Fixa" : "Lançamentos: Valor por Hora"}
            </h3>
            <span className="text-xs font-semibold px-3 py-1 bg-secondary text-muted-foreground rounded-full">
              {filteredPayments?.length || 0} Registros
            </span>
          </div>
          
          {isLoading ? (
            <div className="flex h-32 items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : !filteredPayments || filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">Nenhum pagamento registrado nesta categoria.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tente alterar os filtros de mês ou gerar faturas do mês.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-secondary/50 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap truncate min-w-[200px]">Aluno</th>
                    <th className="px-6 py-4 whitespace-nowrap truncate">Detalhes</th>
                    <th className="px-6 py-4 whitespace-nowrap truncate min-w-[120px]">Valor Total</th>
                    <th className="px-6 py-4 whitespace-nowrap truncate">Status</th>
                    <th className="px-6 py-4 text-right whitespace-nowrap truncate min-w-[150px]">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPayments.map((payment, idx) => {
                    const studentName = (payment as any).student?.name || "Desconhecido";
                    const initial = getInitials(studentName);
                    const colorClass = avatarColors[idx % avatarColors.length];
                    
                    return (
                      <tr key={payment.id} className="hover:bg-secondary/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`size-8 shrink-0 rounded-full flex items-center justify-center font-bold text-xs ${colorClass}`}>
                              {initial}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <p className="text-sm font-bold text-foreground truncate max-w-[140px] md:max-w-[200px]">{studentName}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[140px] md:max-w-[200px]">{(payment as any).student?.school || "Sem escola"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           {activeTab === "HOURLY" ? (
                             <span className="text-sm font-medium text-muted-foreground whitespace-nowrap truncate">
                               {payment.classHours} hrs x R${(payment as any).student?.hourlyRate?.toFixed(2) || "0.00"}
                             </span>
                           ) : (
                             <span className="text-sm font-medium text-muted-foreground whitespace-nowrap truncate">
                               Mês de Referência
                             </span>
                           )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-foreground whitespace-nowrap truncate">
                            R$ {payment.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                              payment.paid
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}
                          >
                            {payment.paid ? "Pago" : "Pendente"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleTogglePaid(payment.id, payment.paid)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap truncate ${
                                payment.paid
                                  ? "text-muted-foreground hover:bg-secondary"
                                  : "text-primary bg-primary/10 hover:bg-primary/20"
                              }`}
                            >
                              {payment.paid ? "Desfazer" : "Marcar Pago"}
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("Tem certeza que deseja apagar este lançamento?")) {
                                  deletePayment.mutate(payment.id);
                                }
                              }}
                              className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors shrink-0"
                              title="Apagar"
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
          <h3 className="text-xl font-bold text-foreground">Visão Resumida do Mês</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col gap-3 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4"></div>
               <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Status</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase w-fit">Pagos Total</span>
                  </div>
               </div>
               <div className="flex justify-between items-end mt-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Valor Acumulado</span>
                    <span className="text-xl font-black text-foreground">R$ {totalReceived.toFixed(2)}</span>
                  </div>
               </div>
            </div>
            
            <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col gap-3 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full -mr-4 -mt-4"></div>
               <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Status</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 uppercase w-fit">Pendentes Total</span>
                  </div>
               </div>
               <div className="flex justify-between items-end mt-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Valor a Receber</span>
                    <span className="text-xl font-black text-foreground">R$ {totalPending.toFixed(2)}</span>
                  </div>
               </div>
            </div>
            
            <div className="bg-card p-5 rounded-xl border border-primary/20 shadow-sm flex flex-col gap-3 relative overflow-hidden border-dashed">
               <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full -mr-4 -mt-4"></div>
               <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">Projeção</span>
                    <span className="text-sm font-bold text-foreground">Total do Mês</span>
                  </div>
               </div>
               <div className="flex justify-between items-end mt-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Soma Máxima</span>
                    <span className="text-xl font-black text-primary">R$ {totalExpected.toFixed(2)}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Payment MODAL Form */}
      {showManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card rounded-2xl p-6 w-full max-w-lg border border-border shadow-2xl relative">
            <button 
              onClick={() => setShowManual(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-secondary rounded-full"
            >
              <XIcon className="h-5 w-5" />
            </button>
            <h3 className="mb-6 text-xl font-black text-foreground">
              Novo Lançamento Avulso <span className="text-primary text-sm align-middle ml-2">({months[month - 1]}/{year})</span>
            </h3>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Aluno *</label>
                <select
                  value={manualForm.studentId}
                  onChange={(e) => setManualForm({ ...manualForm, studentId: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                >
                  <option value="">Selecione um aluno...</option>
                  {students?.filter((s) => s.active).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Tipo de Cobrança *</label>
                <select
                  value={manualForm.billingType}
                  onChange={(e) => setManualForm({ ...manualForm, billingType: e.target.value as any })}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                >
                  <option value="MONTHLY">Mensalidade Fixa</option>
                  <option value="HOURLY">Por Hora-Aula</option>
                </select>
              </div>

              {manualForm.billingType === "HOURLY" ? (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">Quantidade de Horas *</label>
                  <input
                    type="number"
                    step="0.5"
                    value={manualForm.classHours || ""}
                    onChange={(e) => setManualForm({ ...manualForm, classHours: Number(e.target.value) })}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    placeholder="Ex: 10"
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">Valor Calculado (R$) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={manualForm.amount || ""}
                      onChange={(e) => setManualForm({ ...manualForm, amount: Number(e.target.value) })}
                      className="w-full pl-12 pr-4 rounded-lg border border-input bg-background py-3 text-foreground focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg"
                      placeholder="500.00"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 mt-2 border-t border-border">
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualForm.studentId}
                  className="flex-1 rounded-xl gradient-primary px-4 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
                >
                  Lançar Pagamento
                </button>
                <button
                  onClick={() => setShowManual(false)}
                  className="flex-1 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-bold text-foreground hover:bg-accent"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Confirmation MODAL */}
      {showGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
           <div className="bg-card rounded-2xl p-6 w-full max-w-md border border-border shadow-2xl relative text-center">
             <div className="mx-auto size-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8" />
             </div>
             
             <h3 className="text-xl font-black text-foreground mb-2">Gerar Mensalidades</h3>
             
             <p className="text-muted-foreground mb-6">
                Todas as faturas pendentes do mês de <strong>{months[month - 1]} de {year}</strong> para alunos ativos (Mensalidade e Por Hora) serão geradas no sistema.
             </p>
             
             <div className="flex gap-3">
               <button
                 onClick={() => setShowGenerate(false)}
                 className="flex-1 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-bold text-foreground hover:bg-accent"
               >
                 Agora não
               </button>
               <button
                 onClick={handleGeneratePayments}
                 className="flex-1 rounded-xl gradient-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:opacity-90"
               >
                 Confirmar Geração
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
