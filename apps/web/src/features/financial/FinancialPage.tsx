import { useState } from "react";
import {
  usePayments,
  useGeneratePayments,
  useMarkPaid,
  useCreatePayment,
  useDeletePayment,
} from "../payments/hooks/usePayments";
import { useStudents } from "../students/hooks/useStudents";
import { DollarSign, Plus, Check, X as XIcon, Trash2 } from "lucide-react";

export function FinancialPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showGenerate, setShowGenerate] = useState(false);
  const [showManual, setShowManual] = useState(false);
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

  const paidCount = payments?.filter((p) => p.paid).length ?? 0;
  const pendingCount = payments?.filter((p) => !p.paid).length ?? 0;
  const totalReceived =
    payments?.filter((p) => p.paid).reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const totalPending =
    payments?.filter((p) => !p.paid).reduce((sum, p) => sum + p.amount, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground">Controle de mensalidades</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowManual(!showManual)}
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4" />
            Lançamento Avulso
          </button>
          <button
            onClick={() => setShowGenerate(!showGenerate)}
            className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25"
          >
            <Plus className="h-4 w-4" />
            Gerar Mensalidades
          </button>
        </div>
      </div>

      {/* Manual Payment Form */}
      {showManual && (
        <div className="glass rounded-2xl p-6">
          <h3 className="mb-4 font-semibold text-foreground">
            Novo Lançamento Avulso ({months[month - 1]}/{year})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Aluno
              </label>
              <select
                value={manualForm.studentId}
                onChange={(e) =>
                  setManualForm({ ...manualForm, studentId: e.target.value })
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-foreground"
              >
                <option value="">Selecione...</option>
                {students
                  ?.filter((s) => s.active)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Tipo de Cobrança
              </label>
              <select
                value={manualForm.billingType}
                onChange={(e) =>
                  setManualForm({
                    ...manualForm,
                    billingType: e.target.value as any,
                  })
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-foreground"
              >
                <option value="MONTHLY">Mensalidade Fixa</option>
                <option value="HOURLY">Por Hora-Aula</option>
              </select>
            </div>

            {manualForm.billingType === "HOURLY" ? (
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Quantidade de Horas
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={manualForm.classHours || ""}
                  onChange={(e) =>
                    setManualForm({
                      ...manualForm,
                      classHours: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-foreground"
                  placeholder="Ex: 10"
                />
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={manualForm.amount || ""}
                  onChange={(e) =>
                    setManualForm({
                      ...manualForm,
                      amount: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-foreground"
                  placeholder="Ex: 500.00"
                />
              </div>
            )}

            <button
              onClick={handleManualSubmit}
              className="rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-white"
            >
              Lançar
            </button>

            <button
              onClick={() => setShowManual(false)}
              className="rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Generate Confirmation */}
      {showGenerate && (
        <div className="glass rounded-2xl p-6">
          <p className="text-foreground mb-4">
            Gerar mensalidades de{" "}
            <strong>
              {months[month - 1]}/{year}
            </strong>{" "}
            para todos os alunos ativos?
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleGeneratePayments}
              className="rounded-lg gradient-success px-4 py-2 text-sm font-semibold text-white"
            >
              Confirmar
            </button>
            <button
              onClick={() => setShowGenerate(false)}
              className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Month/Year Filter */}
      <div className="flex items-center gap-4">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="rounded-lg border border-input bg-background px-4 py-2.5 text-foreground"
        >
          {months.map((m, i) => (
            <option key={i} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-lg border border-input bg-background px-4 py-2.5 text-foreground"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-2xl p-5">
          <p className="text-sm text-muted-foreground">Recebido</p>
          <p className="text-2xl font-bold text-success">
            R$ {totalReceived.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            {paidCount} pagamentos
          </p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-sm text-muted-foreground">Pendente</p>
          <p className="text-2xl font-bold text-warning">
            R$ {totalPending.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            {pendingCount} pagamentos
          </p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-sm text-muted-foreground">Total Esperado</p>
          <p className="text-2xl font-bold text-foreground">
            R$ {(totalReceived + totalPending).toFixed(2)}
          </p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-sm text-muted-foreground">Taxa de Recebimento</p>
          <p className="text-2xl font-bold text-primary">
            {payments && payments.length > 0
              ? Math.round((paidCount / payments.length) * 100)
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Payments List */}
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : !payments || payments.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Nenhum pagamento para {months[month - 1]}/{year}.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Clique em "Gerar Mensalidades" para criar os pagamentos do mês.
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-xs font-medium uppercase text-muted-foreground">
                  Aluno
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase text-muted-foreground">
                  Tipo
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase text-muted-foreground">
                  Valor
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase text-muted-foreground">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="hover:bg-background/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-foreground">
                    {(payment as any).student?.name || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      {payment.billingType === "HOURLY"
                        ? `Por Hora (${payment.classHours}h)`
                        : "Mensal"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    R$ {payment.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${
                        payment.paid
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-warning/10 text-warning border-warning/20"
                      }`}
                    >
                      {payment.paid ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <XIcon className="h-3 w-3" />
                      )}
                      {payment.paid ? "Pago" : "Pendente"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          handleTogglePaid(payment.id, payment.paid)
                        }
                        className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                          payment.paid
                            ? "border border-border bg-secondary text-foreground hover:bg-accent"
                            : "gradient-success text-white shadow-lg shadow-success/25"
                        }`}
                      >
                        {payment.paid ? "Desfazer" : "Marcar Pago"}
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Tem certeza que deseja apagar este lançamento?",
                            )
                          ) {
                            deletePayment.mutate(payment.id);
                          }
                        }}
                        className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                        title="Apagar Lançamento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
