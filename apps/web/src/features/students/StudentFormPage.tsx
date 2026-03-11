import { useEffect, useState, useRef } from "react";
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
  Camera,
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
} from "lucide-react";
import type { BillingType } from "@tutorfy/types";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Header } from "@/components/layout/Header";

const schedulePreferenceSchema = z.object({
  dayOfWeek: z.coerce.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido"),
});

const studentSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
    avatarUrl: z.string().optional().nullable(),
    grade: z.string().min(1, "Série é obrigatória"),
    school: z.string().min(1, "Escola é obrigatória"),
    responsibleName: z.string().min(2, "Nome do responsável é obrigatório"),
    responsiblePhone: z
      .string()
      .refine(
        (v) => v.replace(/\D/g, "").length >= 10,
        "Telefone inválido (mínimo 10 dígitos)",
      ),
    billingType: z.enum(["MONTHLY", "HOURLY"] as const).default("MONTHLY"),
    monthlyFee: z.coerce
      .number()
      .min(0, "Valor não pode ser negativo")
      .optional()
      .default(0),
    hourlyRate: z.coerce
      .number()
      .positive("Valor deve ser positivo")
      .optional()
      .or(z.literal(0))
      .nullable(),

    // Dummy fields for UI completeness based on Stitch Design
    birthDate: z.string().optional(),
    shift: z.string().optional(),
    cpf: z
      .string()
      .optional()
      .refine(
        (v) => !v || v.replace(/\D/g, "").length === 0 || v.replace(/\D/g, "").length === 11,
        "CPF inválido",
      ),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    dueDate: z.string().optional(),
    schedulePreferences: z
      .array(schedulePreferenceSchema)
      .optional()
      .default([]),
  })
  .refine(
    (data) => {
      if (data.billingType === "MONTHLY") return (data.monthlyFee ?? 0) > 0;
      return true;
    },
    {
      message: "Mensalidade é obrigatória no plano mensal",
      path: ["monthlyFee"],
    },
  )
  .refine(
    (data) => {
      if (data.billingType === "HOURLY")
        return data.hourlyRate != null && data.hourlyRate > 0;
      return true;
    },
    {
      message: "Valor por hora é obrigatório no plano por hora",
      path: ["hourlyRate"],
    },
  );

type StudentFormData = z.infer<typeof studentSchema>;

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3}\.\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3}\.\d{3}\.\d{3})(\d)/, "$1-$2");
}

function inputClass(hasError: boolean) {
  return `glass-input rounded-lg px-4 py-3 w-full outline-none transition-all${hasError ? " !border-red-500/50" : ""}`;
}

export function StudentFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: student, isLoading } = useStudent(id);
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();

  const [isUploading, setIsUploading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [grades, setGrades] = useState<string[]>([
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
  ]);

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
      billingType: "MONTHLY",
      monthlyFee: 0,
      hourlyRate: null,
      shift: "morning",
      dueDate: "10",
      schedulePreferences: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "schedulePreferences",
  });

  const billingType = useWatch({ control, name: "billingType" });
  const avatarUrl = useWatch({ control, name: "avatarUrl" });

  useEffect(() => {
    if (student) {
      reset({
        name: student.name,
        avatarUrl: student.avatarUrl,
        grade: student.grade,
        school: student.school,
        responsibleName: student.responsibleName,
        responsiblePhone: student.responsiblePhone,
        billingType: student.billingType as BillingType,
        monthlyFee: student.monthlyFee,
        hourlyRate: student.hourlyRate,

        // Dummy mappings to not break UI continuity if switching to server data
        birthDate: "2010-01-01",
        shift: "morning",
        cpf: "",
        email: "",
        dueDate: "10",
        schedulePreferences: student.schedulePreferences || [],
      });
    }
  }, [student, reset]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const uploadResult = await response.json();
      setValue("avatarUrl", uploadResult.url, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      setShowErrorModal(true);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const onSubmit = async (data: StudentFormData) => {
    try {
      const payload = {
        name: data.name,
        avatarUrl: data.avatarUrl ?? undefined,
        grade: data.grade,
        school: data.school,
        responsibleName: data.responsibleName,
        responsiblePhone: data.responsiblePhone,
        billingType: data.billingType,
        monthlyFee: data.monthlyFee,
        hourlyRate: data.hourlyRate ?? undefined,
        schedulePreferences: data.schedulePreferences,
      };

      if (isEditing) {
        await updateStudent.mutateAsync({ id, data: payload });
      } else {
        await createStudent.mutateAsync(payload);
      }
      navigate("/students");
    } catch (err) {
      console.error(err);
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
            <button
              type="submit"
              form="student-form"
              disabled={isUploading || isSubmitting}
              className="gradient-primary hover:opacity-90 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting
                ? "Salvando..."
                : isEditing
                  ? "Salvar Alterações"
                  : "Cadastrar Aluno"}
            </button>
          </div>
        }
      />

      <div className="flex-1 w-full max-w-4xl mx-auto px-2 py-8 sm:px-6 sm:py-10">
        <form
          id="student-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8"
        >
          {/* Section 1: Informações Pessoais */}
          <section className="glass-panel p-6 sm:p-8 rounded-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-6 w-6 text-primary" />
              <h3 className="text-white text-xl font-bold uppercase tracking-wider">
                Informações Pessoais
              </h3>
            </div>
            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="flex flex-col items-center gap-4 mx-auto md:mx-0">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-32 h-32 rounded-full border-2 border-dashed border-primary/40 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors group relative overflow-hidden bg-slate-800 ${isUploading ? "opacity-50" : ""}`}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <>
                      <Camera className="h-10 w-10 text-slate-500 group-hover:text-primary transition-colors" />
                      <p className="text-[10px] text-slate-500 mt-2 font-medium group-hover:text-primary transition-colors">
                        UPLOAD FOTO
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  aria-label="Fazer upload de foto"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <p className="text-xs text-slate-500 italic text-center">
                  Tamanho máx: 5MB
                  <br />
                  PNG, JPG
                </p>
              </div>

              <div className="flex-1 grid grid-cols-1 gap-6 w-full">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-300">
                    Nome Completo *
                  </label>
                  <input
                    {...register("name")}
                    className={inputClass(!!errors.name)}
                    placeholder="Ex: Lucas Gabriel Oliveira"
                    type="text"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-400 font-medium">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-300">
                    Data de Nascimento
                  </label>
                  <input
                    {...register("birthDate")}
                    className="glass-input rounded-lg px-4 py-3 w-full outline-none appearance-none transition-all text-slate-300"
                    type="date"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Informações Acadêmicas */}
          <section className="glass-panel p-6 sm:p-8 rounded-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Book className="h-6 w-6 text-primary" />
              <h3 className="text-white text-xl font-bold uppercase tracking-wider">
                Informações Acadêmicas
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">
                  Colégio *
                </label>
                <input
                  {...register("school")}
                  className={inputClass(!!errors.school)}
                  placeholder="Nome da Instituição"
                  type="text"
                />
                {errors.school && (
                  <p className="text-xs text-red-400 font-medium">
                    {errors.school.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">
                  Série *
                </label>
                <select
                  {...register("grade")}
                  className={`${inputClass(!!errors.grade)} appearance-none cursor-pointer`}
                >
                  <option value="" className="text-slate-900">
                    Selecione...
                  </option>
                  {grades.map((grade) => (
                    <option
                      key={grade}
                      value={grade}
                      className="text-slate-900"
                    >
                      {grade}
                    </option>
                  ))}
                </select>
                {errors.grade && (
                  <p className="text-xs text-red-400 font-medium">
                    {errors.grade.message}
                  </p>
                )}
              </div>
              <div className="md:col-span-2 flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-300">
                  Turno Escolar
                </label>
                <div className="flex p-1.5 glass-panel bg-slate-900/40 rounded-xl w-fit">
                  <label className="cursor-pointer">
                    <input
                      {...register("shift")}
                      value="morning"
                      className="peer sr-only"
                      name="shift"
                      type="radio"
                    />
                    <div className="px-8 py-2 rounded-lg text-sm font-bold text-slate-400 peer-checked:bg-primary peer-checked:text-white transition-all shadow-none peer-checked:shadow-lg">
                      Manhã
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input
                      {...register("shift")}
                      value="afternoon"
                      className="peer sr-only"
                      name="shift"
                      type="radio"
                    />
                    <div className="px-8 py-2 rounded-lg text-sm font-bold text-slate-400 peer-checked:bg-primary peer-checked:text-white transition-all shadow-none peer-checked:shadow-lg">
                      Tarde
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Responsáveis */}
          <section className="glass-panel p-6 sm:p-8 rounded-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Family className="h-6 w-6 text-primary" />
              <h3 className="text-white text-xl font-bold uppercase tracking-wider">
                Responsáveis
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">
                  Nome do Responsável *
                </label>
                <input
                  {...register("responsibleName")}
                  className={inputClass(!!errors.responsibleName)}
                  type="text"
                  placeholder="Nome completo"
                />
                {errors.responsibleName && (
                  <p className="text-xs text-red-400 font-medium">
                    {errors.responsibleName.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">
                  CPF
                </label>
                <Controller
                  name="cpf"
                  control={control}
                  render={({ field }) => (
                    <input
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(maskCpf(e.target.value))
                      }
                      className={inputClass(!!errors.cpf)}
                      placeholder="000.000.000-00"
                      inputMode="numeric"
                      type="text"
                    />
                  )}
                />
                {errors.cpf && (
                  <p className="text-xs text-red-400 font-medium">
                    {errors.cpf.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">
                  Telefone / WhatsApp *
                </label>
                <Controller
                  name="responsiblePhone"
                  control={control}
                  render={({ field }) => (
                    <input
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(maskPhone(e.target.value))
                      }
                      className={inputClass(!!errors.responsiblePhone)}
                      placeholder="(00) 00000-0000"
                      inputMode="tel"
                      type="tel"
                    />
                  )}
                />
                {errors.responsiblePhone && (
                  <p className="text-xs text-red-400 font-medium">
                    {errors.responsiblePhone.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">
                  E-mail
                </label>
                <input
                  {...register("email")}
                  className={inputClass(!!errors.email)}
                  placeholder="responsavel@email.com"
                  type="email"
                />
                {errors.email && (
                  <p className="text-xs text-red-400 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Section 4: Cobrança */}
          <section className="glass-panel p-6 sm:p-8 rounded-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="h-6 w-6 text-primary" />
              <h3 className="text-white text-xl font-bold uppercase tracking-wider">
                Cobrança
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <label className="cursor-pointer relative">
                <input
                  {...register("billingType")}
                  value="MONTHLY"
                  className="peer sr-only"
                  name="billingType"
                  type="radio"
                />
                <div className="h-full p-6 rounded-xl glass-panel border-2 border-transparent peer-checked:border-primary peer-checked:bg-primary/10 transition-all flex flex-col gap-2 peer-checked:purple-glow">
                  <CalendarSync className="h-6 w-6 text-primary peer-checked:text-primary transition-colors" />
                  <h4 className="text-white font-bold text-lg">
                    Mensalidade Fixa
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ideal para planos recorrentes com valor fechado todo mês.
                  </p>
                </div>
              </label>
              <label className="cursor-pointer relative">
                <input
                  {...register("billingType")}
                  value="HOURLY"
                  className="peer sr-only"
                  name="billingType"
                  type="radio"
                />
                <div className="h-full p-6 rounded-xl glass-panel border-2 border-transparent peer-checked:border-primary peer-checked:bg-primary/10 transition-all flex flex-col gap-2 peer-checked:purple-glow">
                  <Clock className="h-6 w-6 text-slate-400 peer-checked:text-primary transition-colors" />
                  <h4 className="text-white font-bold text-lg">
                    Valor por Hora
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Cobrança baseada no tempo real de tutoria realizado.
                  </p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">
                  Vencimento
                </label>
                <select
                  {...register("dueDate")}
                  className="glass-input rounded-lg px-4 py-3 w-full outline-none appearance-none cursor-pointer text-slate-300 transition-all"
                >
                  <option value="05" className="text-slate-900">
                    Dia 05
                  </option>
                  <option value="10" className="text-slate-900">
                    Dia 10
                  </option>
                  <option value="15" className="text-slate-900">
                    Dia 15
                  </option>
                  <option value="20" className="text-slate-900">
                    Dia 20
                  </option>
                  <option value="25" className="text-slate-900">
                    Dia 25
                  </option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                {billingType === "MONTHLY" ? (
                  <>
                    <label className="text-sm font-semibold text-slate-300">
                      Valor da Mensalidade *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">
                        R$
                      </span>
                      <input
                        {...register("monthlyFee")}
                        className={`${inputClass(!!errors.monthlyFee)} pl-12 font-bold text-lg`}
                        placeholder="450.00"
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                      />
                    </div>
                    {errors.monthlyFee && (
                      <p className="text-xs text-red-400 font-medium">
                        {errors.monthlyFee.message}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <label className="text-sm font-semibold text-slate-300">
                      Valor Base Hora-Aula *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">
                        R$
                      </span>
                      <input
                        {...register("hourlyRate")}
                        className={`${inputClass(!!errors.hourlyRate)} pl-12 font-bold text-lg`}
                        placeholder="80.00"
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                      />
                    </div>
                    {errors.hourlyRate && (
                      <p className="text-xs text-red-400 font-medium">
                        {errors.hourlyRate.message}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Section 5: Horários */}
          <section className="glass-panel p-6 sm:p-8 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-primary" />
                <h3 className="text-white text-xl font-bold uppercase tracking-wider">
                  Horários
                </h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  append({ dayOfWeek: 1, startTime: "14:00", endTime: "15:00" })
                }
                className="flex items-center gap-2 px-4 py-2 rounded-lg glass-panel hover:bg-white/10 transition-colors text-primary text-sm font-bold"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Adicionar Horário</span>
              </button>
            </div>

            {/* Time Slots */}
            {fields.length === 0 ? (
              <div className="text-center py-8 glass-panel bg-slate-900/30 rounded-xl border border-dashed border-white/10">
                <p className="text-sm text-slate-400">
                  Nenhum horário de preferência cadastrado.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    append({
                      dayOfWeek: 1,
                      startTime: "14:00",
                      endTime: "15:00",
                    })
                  }
                  className="mt-2 text-sm text-primary font-bold hover:text-primary/80 transition-colors"
                >
                  Adicionar um agora
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col md:flex-row items-center gap-4 p-4 glass-input rounded-xl bg-slate-900/30"
                  >
                    <div className="w-full md:flex-1 md:min-w-[120px]">
                      <select
                        {...register(`schedulePreferences.${index}.dayOfWeek`)}
                        className="bg-transparent border-none text-white text-sm w-full focus:ring-0 appearance-none cursor-pointer"
                      >
                        <option value={0} className="text-slate-900">
                          Domingo
                        </option>
                        <option value={1} className="text-slate-900">
                          Segunda-feira
                        </option>
                        <option value={2} className="text-slate-900">
                          Terça-feira
                        </option>
                        <option value={3} className="text-slate-900">
                          Quarta-feira
                        </option>
                        <option value={4} className="text-slate-900">
                          Quinta-feira
                        </option>
                        <option value={5} className="text-slate-900">
                          Sexta-feira
                        </option>
                        <option value={6} className="text-slate-900">
                          Sábado
                        </option>
                      </select>
                    </div>
                    <div className="flex w-full md:w-auto items-center gap-2 justify-between md:justify-center">
                      <input
                        {...register(`schedulePreferences.${index}.startTime`)}
                        className="bg-transparent border-none text-white text-sm focus:ring-0 placeholder-slate-500 w-full md:w-24 text-center"
                        type="time"
                      />
                      <span className="text-slate-500 text-sm">até</span>
                      <input
                        {...register(`schedulePreferences.${index}.endTime`)}
                        className="bg-transparent border-none text-white text-sm focus:ring-0 placeholder-slate-500 w-full md:w-24 text-center"
                        type="time"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label="Deletar horário"
                      className="w-full md:w-auto flex justify-center text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors mt-2 md:mt-0 md:ml-auto"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tip */}
            <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-4">
              <span className="text-blue-400 text-2xl">💡</span>
              <p className="text-sm text-blue-100/80 leading-relaxed">
                <strong className="text-blue-300">Dica:</strong> Defina os
                horários base para automatizar a agenda semanal. O sistema
                enviará lembretes 30 minutos antes de cada sessão.
              </p>
            </div>
          </section>

          {/* Form Actions */}
          <footer className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 sm:gap-6 pt-6 pb-20">
            <button
              type="button"
              onClick={() => navigate("/students")}
              className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full sm:w-auto px-10 py-3 rounded-xl bg-gradient-to-r from-primary to-[#9333ea] text-white font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting
                ? "Salvando..."
                : isEditing
                  ? "Atualizar Aluno"
                  : "Salvar Aluno"}
            </button>
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
