import { useEffect, useState } from "react";
import { toast } from '@tutorfy/ui';
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
  X,
  UserRound,
  Search,
} from "lucide-react";
import { useGuardians, type Guardian } from "@/features/guardians/hooks/useGuardians";
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalBody,
} from '@tutorfy/ui';
import type { BillingType } from "@tutorfy/types";
import { ConfirmModal } from "@/components/ConfirmModal";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useCanAddStudent } from "@/hooks/useSubscription";
import { Header } from "@/components/layout/Header";
import { Input, InputField } from '@tutorfy/ui';
import { Select, SelectItem } from '@tutorfy/ui';
import { Button } from '@tutorfy/ui';
import { DatePicker } from '@tutorfy/ui';
import { TimePicker } from '@tutorfy/ui';
import { ImageUpload } from '@tutorfy/ui';
import { format as fmtDate, parse as parseDate } from "date-fns";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schedulePreferenceSchema = z.object({
  dayOfWeek: z.coerce.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido"),
  endTime:   z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido"),
});

const studentSchema = z
  .object({
    name:        z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
    avatarUrl:   z.string().optional().nullable(),
    grade:       z.string().min(1, "Série é obrigatória"),
    school:      z.string().min(1, "Escola é obrigatória"),
    guardianIds: z.array(z.string()).optional().default([]),
    billingType: z.enum(["MONTHLY", "HOURLY"] as const).default("MONTHLY"),
    monthlyFee:  z.coerce.number().min(0).optional().default(0),
    hourlyRate:  z.coerce.number().positive("Valor deve ser positivo").optional().or(z.literal(0)).nullable(),
    birthDate:   z.string().optional(),
    shift:       z.string().optional(),
    dueDate:     z.string().optional(),
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

// ─── Guardian Picker Modal ────────────────────────────────────────────────────

function GuardianPickerModal({
  open,
  onClose,
  onSelect,
  excludeIds,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (guardian: Guardian) => void;
  excludeIds: string[];
}) {
  const [search, setSearch] = useState("");
  const { data: guardiansData } = useGuardians({ search: search || undefined, limit: 20 });
  const guardians = (guardiansData?.data ?? []).filter((g) => !excludeIds.includes(g.id));

  return (
    <Modal open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>Vincular responsável</ModalTitle>
        </ModalHeader>
        <ModalBody className="p-0">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar responsável..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {guardians.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">
                {search ? "Nenhum responsável encontrado." : "Todos os responsáveis já estão vinculados."}
              </p>
            ) : (
              guardians.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => { onSelect(g); onClose(); }}
                  className="flex w-full items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-0"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 text-sm">
                    {g.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{g.name}</p>
                    {(g.phone || g.email) && (
                      <p className="text-xs text-muted-foreground truncate">
                        {[g.phone, g.email].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

// ─── Wrapper ──────────────────────────────────────────────────────────────────

export function StudentFormPage() {
  const { id }    = useParams<{ id: string }>();
  const isEditing = !!id;
  const { data: student, isLoading } = useStudent(id);

  if (isEditing && isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // For editing, wait until student is loaded before mounting the form.
  // This ensures useForm receives correct defaultValues from the start.
  if (isEditing && !student) return null;

  return <StudentFormInner id={id} student={student} isEditing={isEditing} />;
}

// ─── Inner form (mounted only after data is ready) ────────────────────────────

function StudentFormInner({
  id,
  student,
  isEditing,
}: {
  id: string | undefined;
  student: any;
  isEditing: boolean;
}) {
  const navigate    = useNavigate();
  const { canAdd, isAtLimit, max, current } = useCanAddStudent();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (!isEditing && isAtLimit) setShowUpgradeModal(true);
  }, [isEditing, isAtLimit]);

  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();

  const [isUploading,    setIsUploading]    = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: student ? {
      name:        student.name,
      avatarUrl:   student.avatarUrl,
      grade:       student.grade,
      school:      student.school,
      guardianIds: (student.guardians ?? []).map((g: { guardian: { id: string } }) => g.guardian.id),
      billingType: student.billingType as BillingType,
      monthlyFee:  student.monthlyFee,
      hourlyRate:  student.hourlyRate,
      birthDate:   student.birthDate ? student.birthDate.slice(0, 10) : undefined,
      shift:       student.shift || "morning",
      dueDate:     student.dueDate || "10",
      schedulePreferences: student.schedulePreferences || [],
    } : {
      grade:               '',
      guardianIds:         [],
      billingType:         "MONTHLY",
      monthlyFee:          0,
      hourlyRate:          null,
      shift:               "morning",
      dueDate:             "10",
      schedulePreferences: [],
    },
  });

  const guardianIds = watch("guardianIds") ?? [];

  const { fields, append, remove } = useFieldArray({ control, name: "schedulePreferences" });

  // Guardians picker
  const [guardianPickerOpen, setGuardianPickerOpen] = useState(false);
  const { data: guardiansData } = useGuardians({ limit: 100 });

  const billingType = useWatch({ control, name: "billingType" });
  const avatarUrl   = useWatch({ control, name: "avatarUrl" });

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
    if (!isEditing && !canAdd) { setShowUpgradeModal(true); return; }
    const payload = {
      name:                data.name,
      avatarUrl:           data.avatarUrl ?? undefined,
      grade:               data.grade,
      school:              data.school,
      guardianIds:         data.guardianIds ?? [],
      billingType:         data.billingType,
      monthlyFee:          data.monthlyFee,
      hourlyRate:          data.hourlyRate ?? undefined,
      birthDate:           data.birthDate || undefined,
      shift:               data.shift || undefined,
      dueDate:             data.dueDate || undefined,
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
                        value={field.value ? parseDate(field.value, "yyyy-MM-dd", new Date()) : undefined}
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Family className="h-6 w-6 text-primary" />
                <h3 className="text-white text-xl font-bold uppercase tracking-wider">Responsáveis</h3>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setGuardianPickerOpen(true)}
              >
                <Plus />
                Vincular responsável
              </Button>
            </div>

            {/* Guardians vinculados */}
            {guardianIds.length === 0 ? (
              <div className="text-center py-8 glass-panel bg-slate-900/30 rounded-xl border border-dashed border-white/10">
                <UserRound className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Nenhum responsável vinculado.</p>
                <p className="text-xs text-slate-600 mt-1">Cadastre responsáveis em <strong className="text-slate-500">Responsáveis</strong> e vincule aqui.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {guardianIds.map((gid) => {
                  const found = guardiansData?.data.find((x) => x.id === gid)
                    ?? (student?.guardians ?? []).find((x: { guardian: { id: string; name: string; phone: string | null; email: string | null } }) => x.guardian.id === gid)?.guardian;
                  if (!found) return null;
                  const guardian = 'name' in found ? found : (found as { guardian: Guardian }).guardian;
                  return (
                    <div key={gid} className="flex items-center gap-4 p-4 glass-panel rounded-xl bg-slate-900/30">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                        {guardian.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{guardian.name}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {[guardian.phone, guardian.email].filter(Boolean).join(" · ") || "Sem informações de contato"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Desvincular responsável"
                        onClick={() => setValue("guardianIds", guardianIds.filter((id) => id !== gid), { shouldDirty: true })}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <X />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
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

        <GuardianPickerModal
          open={guardianPickerOpen}
          onClose={() => setGuardianPickerOpen(false)}
          onSelect={(g) => setValue("guardianIds", [...guardianIds, g.id], { shouldDirty: true })}
          excludeIds={guardianIds}
        />

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => { setShowUpgradeModal(false); navigate("/students"); }}
          reason="student-limit"
          max={max}
          current={current}
        />

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
