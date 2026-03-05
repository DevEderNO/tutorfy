import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { z } from "zod";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useStudent,
  useCreateStudent,
  useUpdateStudent,
} from "./hooks/useStudents";
import { 
  ChevronRight,
  Upload,
  Camera,
  User, 
  School, 
  Users as Family, 
  CreditCard,
  UserPlus,
  Clock,
  Plus,
  Trash2,
  AlertCircle
} from "lucide-react";
import type { BillingType } from "@tutorfy/types";
import { ConfirmModal } from "@/components/ConfirmModal";

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
    responsiblePhone: z.string().min(8, "Telefone inválido"),
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
    cpf: z.string().optional(),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    dueDate: z.string().optional(),
    schedulePreferences: z.array(schedulePreferenceSchema).optional().default([]),
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
      schedulePreferences: []
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
        schedulePreferences: student.schedulePreferences || []
      });
    }
  }, [student, reset]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadResult = await response.json();
      setValue('avatarUrl', uploadResult.url, { shouldValidate: true, shouldDirty: true });
    } catch (error) {
      console.error('Error uploading image:', error);
      setShowErrorModal(true);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center py-4 px-2 w-full">
      <div className="w-full max-w-[800px]">
        {/* Breadcrumbs and Header */}
        <nav className="flex items-center gap-2 mb-6 text-sm">
          <Link to="/students" className="text-primary hover:underline font-medium">Alunos</Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{isEditing ? "Editar Aluno" : "Cadastro de Novo Aluno"}</span>
        </nav>
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            {isEditing ? "Editar Aluno" : "Cadastro de Novo Aluno"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEditing 
              ? "Atualize as informações do estudante e suas preferências de fatura." 
              : "Preencha os dados abaixo para matricular um novo estudante e configurar as aulas."}
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-16">
          
          {/* Section 1: Informações Pessoais */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-2 mb-6 text-primary">
              <User className="h-6 w-6" />
              <h2 className="text-lg font-bold text-foreground">1. Informações Pessoais</h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start mb-2">
              <div className="relative group shrink-0">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`size-32 rounded-full bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-colors hover:border-primary ${isUploading ? 'opacity-50' : ''}`}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <>
                      <Camera className="text-muted-foreground h-10 w-10 mb-1" />
                      <span className="text-[10px] text-muted-foreground font-bold text-center px-2">FOTO<br/>(MAX 5MB)</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute p-2.5 bottom-0 right-0 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Upload className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-1.5 ml-1">Nome Completo *</label>
                  <input 
                    {...register("name")}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" 
                    placeholder="Ex: João Silva" 
                    type="text"
                  />
                  {errors.name && <p className="mt-1.5 text-xs text-destructive ml-1 font-medium">{errors.name.message}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-1.5 ml-1">Data de Nascimento</label>
                  <input 
                    {...register("birthDate")}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-muted-foreground" 
                    type="date"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Informações Acadêmicas */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-2 mb-6 text-primary">
              <School className="h-6 w-6" />
              <h2 className="text-lg font-bold text-foreground">2. Informações Acadêmicas</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-foreground mb-1.5 ml-1">Colégio / Instituição *</label>
                <input 
                  {...register("school")}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                  placeholder="Nome da escola" 
                  type="text"
                />
                {errors.school && <p className="mt-1.5 text-xs text-destructive ml-1 font-medium">{errors.school.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5 ml-1">Série / Ano *</label>
                <select 
                  {...register("grade")}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">Selecione...</option>
                  <option value="6º Ano Fundamental">6º Ano Fundamental</option>
                  <option value="7º Ano Fundamental">7º Ano Fundamental</option>
                  <option value="8º Ano Fundamental">8º Ano Fundamental</option>
                  <option value="9º Ano Fundamental">9º Ano Fundamental</option>
                  <option value="1º Ano Médio">1º Ano Médio</option>
                  <option value="2º Ano Médio">2º Ano Médio</option>
                  <option value="3º Ano Médio">3º Ano Médio</option>
                  <option value="Outro">Outro</option>
                </select>
                {errors.grade && <p className="mt-1.5 text-xs text-destructive ml-1 font-medium">{errors.grade.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5 ml-1">Turno Escolar</label>
                <div className="flex gap-2 h-[42px]">
                  <label className="flex-1 relative flex h-full">
                    <input {...register("shift")} value="morning" className="peer sr-only" name="shift" type="radio"/>
                    <div className="w-full flex items-center justify-center border rounded-lg border-border bg-background peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary cursor-pointer transition-all text-sm font-bold text-muted-foreground">Manhã</div>
                  </label>
                  <label className="flex-1 relative flex h-full">
                    <input {...register("shift")} value="afternoon" className="peer sr-only" name="shift" type="radio"/>
                    <div className="w-full flex items-center justify-center border rounded-lg border-border bg-background peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary cursor-pointer transition-all text-sm font-bold text-muted-foreground">Tarde</div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Responsáveis */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-2 mb-6 text-primary">
              <Family className="h-6 w-6" />
              <h2 className="text-lg font-bold text-foreground">3. Responsáveis</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-foreground mb-1.5 ml-1">Nome do Responsável Financeiro *</label>
                <input 
                  {...register("responsibleName")}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium" 
                  placeholder="Nome completo" 
                  type="text"
                />
                {errors.responsibleName && <p className="mt-1.5 text-xs text-destructive ml-1 font-medium">{errors.responsibleName.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5 ml-1">CPF</label>
                <input 
                  {...register("cpf")}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                  placeholder="000.000.000-00" 
                  type="text"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5 ml-1">Telefone / WhatsApp *</label>
                <input 
                  {...register("responsiblePhone")}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                  placeholder="(00) 00000-0000" 
                  type="tel"
                />
                {errors.responsiblePhone && <p className="mt-1.5 text-xs text-destructive ml-1 font-medium">{errors.responsiblePhone.message}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-foreground mb-1.5 ml-1">E-mail</label>
                <input 
                  {...register("email")}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                  placeholder="responsavel@email.com" 
                  type="email"
                />
                {errors.email && <p className="mt-1.5 text-xs text-destructive ml-1 font-medium">{errors.email.message}</p>}
              </div>
            </div>
          </div>

          {/* Section 4: Configurações de Cobrança */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center gap-2 mb-6 text-primary">
              <CreditCard className="h-6 w-6" />
              <h2 className="text-lg font-bold text-foreground">4. Configurações de Cobrança</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3 ml-1">Modelo de Pagamento *</label>
                <div className="grid grid-cols-1 gap-3">
                  <label className="relative flex items-center p-4 border rounded-xl cursor-pointer hover:border-primary/50 transition-all border-border bg-background has-[:checked]:bg-primary/5 has-[:checked]:border-primary group">
                    <input {...register("billingType")} value="MONTHLY" className="text-primary border-slate-300 focus:ring-primary mr-3 h-5 w-5" name="billingType" type="radio"/>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground group-has-[:checked]:text-primary">Mensalidade Fixa</span>
                      <span className="text-xs text-muted-foreground mt-0.5">Valor recorrente todos os meses.</span>
                    </div>
                  </label>
                  <label className="relative flex items-center p-4 border rounded-xl cursor-pointer hover:border-primary/50 transition-all border-border bg-background has-[:checked]:bg-primary/5 has-[:checked]:border-primary group">
                    <input {...register("billingType")} value="HOURLY" className="text-primary border-slate-300 focus:ring-primary mr-3 h-5 w-5" name="billingType" type="radio"/>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground group-has-[:checked]:text-primary">Valor por Hora</span>
                      <span className="text-xs text-muted-foreground mt-0.5">Cobrança baseada em aulas realizadas.</span>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="block text-sm font-semibold text-foreground mb-1.5 ml-1">Data de Vencimento</label>
                <select 
                  {...register("dueDate")}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-foreground"
                >
                  <option value="05">Dia 05</option>
                  <option value="10">Dia 10</option>
                  <option value="15">Dia 15</option>
                  <option value="20">Dia 20</option>
                  <option value="25">Dia 25</option>
                </select>
                
                <div className="mt-auto pt-6">
                  <div className="p-5 bg-secondary/30 rounded-xl border border-border">
                    {billingType === "MONTHLY" ? (
                      <>
                        <label className="block text-sm font-bold text-foreground mb-2">Valor da Mensalidade (R$) *</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
                          <input 
                            {...register("monthlyFee")}
                            className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-lg font-black text-foreground" 
                            placeholder="0.00" 
                            type="number"
                            step="0.01"
                          />
                        </div>
                        {errors.monthlyFee && <p className="mt-1.5 text-xs text-destructive font-medium">{errors.monthlyFee.message}</p>}
                      </>
                    ) : (
                      <>
                        <label className="block text-sm font-bold text-foreground mb-2">Valor Base Hora-Aula (R$) *</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
                          <input 
                            {...register("hourlyRate")}
                            className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-lg font-black text-foreground" 
                            placeholder="0.00" 
                            type="number"
                            step="0.01"
                          />
                        </div>
                        {errors.hourlyRate && <p className="mt-1.5 text-xs text-destructive font-medium">{errors.hourlyRate.message}</p>}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Horários de Preferência */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-primary">
                <Clock className="h-6 w-6" />
                <h2 className="text-lg font-bold text-foreground">5. Horários de Preferência</h2>
              </div>
              <button
                type="button"
                onClick={() => append({ dayOfWeek: 1, startTime: "14:00", endTime: "15:00" })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-bold"
              >
                <Plus className="h-4 w-4" />
                Adicionar Horário
              </button>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-8 bg-secondary/20 rounded-xl border border-dashed border-border">
                <p className="text-sm text-muted-foreground">Nenhum horário de preferência cadastrado.</p>
                <button
                  type="button"
                  onClick={() => append({ dayOfWeek: 1, startTime: "14:00", endTime: "15:00" })}
                  className="mt-2 text-sm text-primary font-bold hover:underline"
                >
                  Clique aqui para adicionar o primeiro
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex flex-col md:flex-row items-end gap-3 p-4 bg-secondary/10 rounded-xl border border-border group relative">
                    <div className="flex-1 w-full">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1 ml-1">Dia da Semana</label>
                      <select
                        {...register(`schedulePreferences.${index}.dayOfWeek`)}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary transition-all"
                      >
                        <option value={0}>Domingo</option>
                        <option value={1}>Segunda-feira</option>
                        <option value={2}>Terça-feira</option>
                        <option value={3}>Quarta-feira</option>
                        <option value={4}>Quinta-feira</option>
                        <option value={5}>Sexta-feira</option>
                        <option value={6}>Sábado</option>
                      </select>
                    </div>

                    <div className="w-full md:w-32">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1 ml-1">Início</label>
                      <input
                        {...register(`schedulePreferences.${index}.startTime`)}
                        type="time"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary transition-all"
                      />
                    </div>

                    <div className="w-full md:w-32">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1 ml-1">Término</label>
                      <input
                        {...register(`schedulePreferences.${index}.endTime`)}
                        type="time"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary transition-all"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors md:mb-0.5"
                      title="Remover horário"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <p className="mt-4 text-xs text-muted-foreground bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
              💡 <strong>Dica:</strong> Estes horários aparecerão como sugestões rápidas na agenda ao marcar aulas para este aluno.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-3 pt-6 border-t border-border">
            <button 
              type="button"
              onClick={() => navigate("/students")}
              className="w-full md:w-auto px-8 py-3 rounded-lg text-foreground font-bold hover:bg-secondary border border-transparent hover:border-border transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-10 py-3 rounded-lg gradient-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
            >
              <UserPlus className="h-5 w-5" />
              {isSubmitting ? "Salvando..." : (isEditing ? "Atualizar Aluno" : "Salvar Aluno")}
            </button>
          </div>
        </form>
      </div>

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
  );
}
