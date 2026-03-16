import { useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { useForm, useWatch, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useStudent,
  useCreateStudent,
  useUpdateStudent,
} from "./hooks/useStudents";
import {
  User,
  Book,
  Users as Family,
  CreditCard,
  CalendarSync,
  Clock,
  Calendar,
  Plus,
  Trash2,
  AlertCircle,
  Mail,
  Phone,
} from "lucide-react";
import type { BillingType } from "@tutorfy/types";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Header } from "@/components/layout/Header";
import { Input, InputField } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { ImageUpload } from "@/components/ui/upload";
import { format as fmtDate } from "date-fns";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schedulePreferenceSchema = z.object({
  dayOfWeek: z.coerce.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido"),
  endTime:   z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido"),
});

const studentSchema = z
  .object({
    name:             z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
    avatarUrl:        z.string().optional().nullable(),
    grade:            z.string().min(1, "Série é obrigatória"),
    school:           z.string().min(1, "Escola é obrigatória"),
    responsibleName:  z.string().min(2, "Nome do responsável é obrigatório"),
    responsiblePhone: z.string().refine(
      (v) => v.replace(/\D/g, "").length >= 10,
      "Telefone inválido (mínimo 10 dígitos)",
    ),
    billingType: z.enum(["MONTHLY", "HOURLY"] as const).default("MONTHLY"),
    monthlyFee:  z.coerce.number().min(0).optional().default(0),
    hourlyRate:  z.coerce.number().positive("Valor deve ser positivo").optional().or(z.literal(0)).nullable(),
    birthDate:   z.string().optional(),
    shift:       z.string().optional(),
    cpf: z.string().optional().refine(
      (v) => !v || v.replace(/\D/g, "").length === 0 || v.replace(/\D/g, "").length === 11,
      "CPF inválido",
    ),
    email:               z.string().email("E-mail inválido").optional().or(z.literal("")),
    dueDate:             z.string().optional(),
    schedulePreferences: z.array(schedulePreferenceSchema).optional().default([]),
  })
  .refine(
    (d) => d.billingType !== "MONTHLY" || (d.monthlyFee ?? 0) > 0,
    { message: "Mensalidade é obrigatória no plano mensal", path: ["monthlyFee"] },
  )
  .refine(
    (d) => d.billingType !== "HOURLY" || (d.hourlyRate != null && d.hourlyRate > 0),
    { message: "Valor por hora é obrigatório no plano por hora", path: ["hourlyRate"] },
  );

type StudentFormData = z.infer<typeof studentSchema>;

// ─── Masks ────────────────────────────────────────────────────────────────────

function maskPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10)
    return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

function maskCpf(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3}\.\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3}\.\d{3}\.\d{3})(\d)/, "$1-$2");
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GRADES = [
  "1º Ano Ensino Fundamental",
  "2º Ano Ensino Fundamental",
  "3º Ano Ensino Fundamental",
  "4º Ano Ensino Fundamental",
  "5º Ano Ensino Fundamental",
  "6º Ano Ensino Fundamental",
  "7º Ano Ensino Fundamental",
  "8º Ano Ensino Fundamental",
  "9º Ano Ensino Fundamental",
  "1º Ano Ensino Médio",
  "2º Ano Ensino Médio",
  "3º Ano Ensino Médio",
  "Outro",
]

const WEEK_DAYS = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Segunda-feira" },
  { value: "2", label: "Terça-feira" },
  { value: "3", label: "Quarta-feira" },
  { value: "4", label: "Quinta-feira" },
  { value: "5", label: "Sexta-feira" },
  { value: "6", label: "Sábado" },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function StudentFormPage() {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const isEditing   = !!id;

  const { data: student, isLoading } = useStudent(id);
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();

  const [isUploading,    setIsUploading]    = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      billingType:         "MONTHLY",
      monthlyFee:          0,
      hourlyRate:          null,
      shift:               "morning",
      dueDate:             "10",
      schedulePreferences: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "schedulePreferences" });

  const billingType = useWatch({ control, name: "billingType" });
  const avatarUrl   = useWatch({ control, name: "avatarUrl" });

  useEffect(() => {
    if (student) {
      reset({
        name:             student.name,
        avatarUrl:        student.avatarUrl,
        grade:            student.grade,
        school:           student.school,
        responsibleName:  student.responsibleName,
        responsiblePhone: student.responsiblePhone,
        billingType:      student.billingType as BillingType,
        monthlyFee:       student.monthlyFee,
        hourlyRate:       student.hourlyRate,
        birthDate:        "2010-01-01",
        shift:            "morning",
        cpf:              "",
        email:            "",
        dueDate:          "10",
        schedulePreferences: student.schedulePreferences || [],
      });
    }
  }, [student, reset]);

  const handleAvatarUpload = (file: File) => {
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setValue("avatarUrl", reader.result as string, { shouldValidate: true, shouldDirty: true });
      setIsUploading(false);
    };
    reader.onerror = () => {
      setIsUploading(false);
      setShowErrorModal(true);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: StudentFormData) => {
    const payload = {
      name:                data.name,
      avatarUrl:           data.avatarUrl ?? undefined,
      grade:               data.grade,
      school:              data.school,
      responsibleName:     data.responsibleName,
      responsiblePhone:    data.responsiblePhone,
      billingType:         data.billingType,
      monthlyFee:          data.monthlyFee,
      hourlyRate:          data.hourlyRate ?? undefined,
      schedulePreferences: data.schedulePreferences,
    };

    const promise = isEditing
      ? updateStudent.mutateAsync({ id, data: payload })
      : createStudent.mutateAsync(payload);

    toast.promise(promise, {
      loading: isEditing ? 'Salvando alterações...' : 'Cadastrando aluno...',
      success: isEditing ? 'Aluno atualizado com sucesso!' : 'Aluno cadastrado com sucesso!',
      error:   'Não foi possível salvar. Tente novamente.',
    });

    try {
      await promise;
      navigate("/students");
    } catch {
      // erro já exibido pelo toast
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title={isEditing ? `Editar: ${student?.name || "Aluno"}` : "Novo Aluno"}
        actions={
          <div className="flex items-center gap-3 mr-2">
            <Button
              type="submit"
              form="student-form"
              disabled={isUploading || isSubmitting}
            >
              {isSubmitting ? "Salvando..." : isEditing ? "Salvar Alterações" : "Cadastrar Aluno"}
            </Button>
          </div>
        }
      />

      <div className="flex-1 w-full max-w-4xl mx-auto px-2 py-8 sm:px-6 sm:py-10">
        <form id="student-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* ── Seção 1: Informações Pessoais ── */}
          <section className="glass-panel p-6 sm:p-8 rounded-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-6 w-6 text-primary" />
              <h3 className="text-white text-xl font-bold uppercase tracking-wider">
                Informações Pessoais
              </h3>
            </div>

            <div className="flex flex-col md:flex-row gap-10 items-start">
              {/* Avatar upload */}
              <div className="flex flex-col items-center gap-3 mx-auto md:mx-0">
                <ImageUpload
                  size="lg"
                  shape="circle"
                  value={avatarUrl ?? undefined}
                  onChange={handleAvatarUpload}
                  onRemove={() => setValue("avatarUrl", null, { shouldDirty: true })}
                  isLoading={isUploading}
                  accept="image/png,image/jpeg,image/webp"
                />
                <p className="text-xs text-slate-500 italic text-center">
                  Máx: 5MB · PNG, JPG
                </p>
              </div>

              <div className="flex-1 grid grid-cols-1 gap-5 w-full">
                <InputField label="Nome Completo" required error={errors.name?.message} htmlFor="name">
                  <Input
                    id="name"
                    {...register("name")}
                    state={errors.name ? "error" : "default"}
                    size="lg"
                    placeholder="Ex: Lucas Gabriel Oliveira"
                  />
                </InputField>

                <InputField label="Data de Nascimento" htmlFor="birthDate">
                  <Controller
                    name="birthDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        size="lg"
                        value={field.value ? new Date(field.value + "T12:00:00") : undefined}
                        onChange={(date) => field.onChange(fmtDate(date, "yyyy-MM-dd"))}
                        placeholder="Selecione a data"
                      />
                    )}
                  />
                </InputField>
              </div>
            </div>
          </section>

          {/* ── Seção 2: Informações Acadêmicas ── */}
          <section className="glass-panel p-6 sm:p-8 rounded-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Book className="h-6 w-6 text-primary" />
              <h3 className="text-white text-xl font-bold uppercase tracking-wider">
                Informações Acadêmicas
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Colégio" required error={errors.school?.message} htmlFor="school">
                <Input
                  id="school"
                  {...register("school")}
                  state={errors.school ? "error" : "default"}
                  size="lg"
                  placeholder="Nome da Instituição"
                />
              </InputField>

              <InputField label="Série" required error={errors.grade?.message}>
                <Controller
                  name="grade"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      state={errors.grade ? "error" : "default"}
                      size="lg"
                      placeholder="Selecione..."
                    >
                      {GRADES.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </Select>
                  )}
                />
              </InputField>

              <div className="md:col-span-2 flex flex-col gap-3">
                <span className="text-sm font-semibold text-slate-300">Turno Escolar</span>
                <div className="flex p-1.5 glass-panel bg-slate-900/40 rounded-xl w-fit">
                  {[
                    { value: "morning",   label: "Manhã" },
                    { value: "afternoon", label: "Tarde" },
                  ].map((opt) => (
                    <label key={opt.value} className="cursor-pointer">
                      <input
                        {...register("shift")}
                        value={opt.value}
                        className="peer sr-only"
                        type="radio"
                      />
                      <div className="px-8 py-2 rounded-lg text-sm font-bold text-slate-400 peer-checked:bg-primary peer-checked:text-white transition-all peer-checked:shadow-lg">
                        {opt.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Seção 3: Responsáveis ── */}
          <section className="glass-panel p-6 sm:p-8 rounded-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Family className="h-6 w-6 text-primary" />
              <h3 className="text-white text-xl font-bold uppercase tracking-wider">
                Responsáveis
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Nome do Responsável" required error={errors.responsibleName?.message} htmlFor="responsibleName">
                <Input
                  id="responsibleName"
                  {...register("responsibleName")}
                  state={errors.responsibleName ? "error" : "default"}
                  size="lg"
                  placeholder="Nome completo"
                />
              </InputField>

              <InputField label="CPF" error={errors.cpf?.message}>
                <Controller
                  name="cpf"
                  control={control}
                  render={({ field }) => (
                    <Input
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(maskCpf(e.target.value))}
                      state={errors.cpf ? "error" : "default"}
                      size="lg"
                      placeholder="000.000.000-00"
                      inputMode="numeric"
                    />
                  )}
                />
              </InputField>

              <InputField label="Telefone / WhatsApp" required error={errors.responsiblePhone?.message}>
                <Controller
                  name="responsiblePhone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(maskPhone(e.target.value))}
                      state={errors.responsiblePhone ? "error" : "default"}
                      size="lg"
                      leadingIcon={<Phone />}
                      placeholder="(00) 00000-0000"
                      inputMode="tel"
                      type="tel"
                    />
                  )}
                />
              </InputField>

              <InputField label="E-mail" error={errors.email?.message} htmlFor="email">
                <Input
                  id="email"
                  {...register("email")}
                  state={errors.email ? "error" : "default"}
                  size="lg"
                  leadingIcon={<Mail />}
                  placeholder="responsavel@email.com"
                  type="email"
                />
              </InputField>
            </div>
          </section>

          {/* ── Seção 4: Cobrança ── */}
          <section className="glass-panel p-6 sm:p-8 rounded-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="h-6 w-6 text-primary" />
              <h3 className="text-white text-xl font-bold uppercase tracking-wider">
                Cobrança
              </h3>
            </div>

            {/* Billing type cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                {
                  value:       "MONTHLY",
                  icon:        <CalendarSync className="h-6 w-6 text-primary" />,
                  title:       "Mensalidade Fixa",
                  description: "Ideal para planos recorrentes com valor fechado todo mês.",
                },
                {
                  value:       "HOURLY",
                  icon:        <Clock className="h-6 w-6 text-slate-400 peer-checked:text-primary transition-colors" />,
                  title:       "Valor por Hora",
                  description: "Cobrança baseada no tempo real de tutoria realizado.",
                },
              ].map((opt) => (
                <label key={opt.value} className="cursor-pointer relative">
                  <input
                    {...register("billingType")}
                    value={opt.value}
                    className="peer sr-only"
                    type="radio"
                  />
                  <div className="h-full p-6 rounded-xl glass-panel border-2 border-transparent peer-checked:border-primary peer-checked:bg-primary/10 transition-all flex flex-col gap-2 peer-checked:purple-glow">
                    {opt.icon}
                    <h4 className="text-white font-bold text-lg">{opt.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Vencimento">
                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      size="lg"
                      placeholder="Selecione..."
                    >
                      {["05", "10", "15", "20", "25"].map((d) => (
                        <SelectItem key={d} value={d}>Dia {d}</SelectItem>
                      ))}
                    </Select>
                  )}
                />
              </InputField>

              <div>
                {billingType === "MONTHLY" ? (
                  <InputField label="Valor da Mensalidade" required error={errors.monthlyFee?.message}>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-sm z-10 pointer-events-none">
                        R$
                      </span>
                      <Input
                        {...register("monthlyFee")}
                        className="pl-10 font-bold text-lg"
                        state={errors.monthlyFee ? "error" : "default"}
                        size="lg"
                        placeholder="450.00"
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                      />
                    </div>
                  </InputField>
                ) : (
                  <InputField label="Valor Base Hora-Aula" required error={errors.hourlyRate?.message}>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-sm z-10 pointer-events-none">
                        R$
                      </span>
                      <Input
                        {...register("hourlyRate")}
                        className="pl-10 font-bold text-lg"
                        state={errors.hourlyRate ? "error" : "default"}
                        size="lg"
                        placeholder="80.00"
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                      />
                    </div>
                  </InputField>
                )}
              </div>
            </div>
          </section>

          {/* ── Seção 5: Horários ── */}
          <section className="glass-panel p-6 sm:p-8 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-primary" />
                <h3 className="text-white text-xl font-bold uppercase tracking-wider">Horários</h3>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => append({ dayOfWeek: 1, startTime: "14:00", endTime: "15:00" })}
              >
                <Plus />
                <span className="hidden sm:inline">Adicionar Horário</span>
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-8 glass-panel bg-slate-900/30 rounded-xl border border-dashed border-white/10">
                <p className="text-sm text-slate-400">Nenhum horário de preferência cadastrado.</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => append({ dayOfWeek: 1, startTime: "14:00", endTime: "15:00" })}
                  className="mt-2 text-primary hover:text-primary/80"
                >
                  Adicionar um agora
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col md:flex-row items-center gap-3 p-4 glass-input rounded-xl bg-slate-900/30"
                  >
                    {/* Dia da semana */}
                    <div className="w-full md:w-48">
                      <Controller
                        name={`schedulePreferences.${index}.dayOfWeek`}
                        control={control}
                        render={({ field: f }) => (
                          <Select
                            value={String(f.value)}
                            onValueChange={(v) => f.onChange(Number(v))}
                            size="sm"
                          >
                            {WEEK_DAYS.map((d) => (
                              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                            ))}
                          </Select>
                        )}
                      />
                    </div>

                    {/* Horários */}
                    <div className="flex w-full md:w-auto items-center gap-2 flex-1">
                      <Controller
                        name={`schedulePreferences.${index}.startTime`}
                        control={control}
                        render={({ field: f }) => (
                          <TimePicker
                            value={f.value}
                            onChange={f.onChange}
                            step={5}
                            size="sm"
                            placeholder="Início"
                            className="flex-1"
                          />
                        )}
                      />
                      <span className="text-slate-500 text-sm shrink-0">até</span>
                      <Controller
                        name={`schedulePreferences.${index}.endTime`}
                        control={control}
                        render={({ field: f }) => (
                          <TimePicker
                            value={f.value}
                            onChange={f.onChange}
                            step={5}
                            size="sm"
                            placeholder="Fim"
                            className="flex-1"
                          />
                        )}
                      />
                    </div>

                    {/* Remover */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remover horário"
                      onClick={() => remove(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-4">
              <span className="text-blue-400 text-2xl">💡</span>
              <p className="text-sm text-blue-100/80 leading-relaxed">
                <strong className="text-blue-300">Dica:</strong> Defina os horários base para
                automatizar a agenda semanal. O sistema enviará lembretes 30 minutos antes de cada
                sessão.
              </p>
            </div>
          </section>

          {/* ── Footer ── */}
          <footer className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 sm:gap-6 pt-6 pb-20">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => navigate("/students")}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || isUploading}
              className="w-full sm:w-auto"
            >
              {isSubmitting
                ? "Salvando..."
                : isEditing
                  ? "Atualizar Aluno"
                  : "Salvar Aluno"}
            </Button>
          </footer>
        </form>

        <ConfirmModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          onConfirm={() => setShowErrorModal(false)}
          title="Erro no Upload"
          description="Não foi possível carregar a imagem. Verifique o tamanho (máx 5MB) e o formato do arquivo."
          confirmLabel="Entendido"
          showCancel={false}
          variant="danger"
          icon={AlertCircle}
        />
      </div>
    </div>
  );
}
