import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useStudent,
  useCreateStudent,
  useUpdateStudent,
} from "./hooks/useStudents";
import { ArrowLeft } from "lucide-react";
import type { BillingType } from "@tutorfy/types";

const studentSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
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

  const { data: student } = useStudent(id);
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      billingType: "MONTHLY",
      monthlyFee: 0,
      hourlyRate: null,
    },
  });

  const billingType = useWatch({ control, name: "billingType" });

  useEffect(() => {
    if (student) {
      reset({
        name: student.name,
        grade: student.grade,
        school: student.school,
        responsibleName: student.responsibleName,
        responsiblePhone: student.responsiblePhone,
        billingType: student.billingType as BillingType,
        monthlyFee: student.monthlyFee,
        hourlyRate: student.hourlyRate,
      });
    }
  }, [student, reset]);

  const onSubmit = async (data: StudentFormData) => {
    try {
      const payload = {
        ...data,
        hourlyRate: data.hourlyRate ?? undefined,
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

  const textFields = [
    {
      name: "name" as const,
      label: "Nome do Aluno",
      placeholder: "Ex: Maria Silva",
      type: "text",
    },
    {
      name: "grade" as const,
      label: "Série",
      placeholder: "Ex: 3º ano",
      type: "text",
    },
    {
      name: "school" as const,
      label: "Escola",
      placeholder: "Ex: Colégio São José",
      type: "text",
    },
    {
      name: "responsibleName" as const,
      label: "Nome do Responsável",
      placeholder: "Ex: Ana Silva",
      type: "text",
    },
    {
      name: "responsiblePhone" as const,
      label: "Telefone do Responsável",
      placeholder: "(11) 99999-9999",
      type: "tel",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/students")}
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary transition-colors"
          title="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? "Editar Aluno" : "Novo Aluno"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Atualize os dados do aluno"
              : "Cadastre um novo aluno"}
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-8 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {textFields.map((field) => (
            <div key={field.name}>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {field.label}
              </label>
              <input
                {...register(field.name)}
                type={field.type}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
              {errors[field.name] && (
                <p className="mt-1 text-sm text-destructive">
                  {errors[field.name]?.message}
                </p>
              )}
            </div>
          ))}

          {/* Billing Type Configuration */}
          <div className="border-t border-border pt-5 mt-5">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Configuração de Cobrança
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Tipo de Cobrança
                </label>
                <select
                  {...register("billingType")}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  title="Selecione o tipo de cobrança"
                >
                  <option value="MONTHLY">Mensalidade Fixa</option>
                  <option value="HOURLY">Por Hora-Aula</option>
                </select>
              </div>

              {billingType === "MONTHLY" ? (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Valor da Mensalidade (R$)
                  </label>
                  <input
                    {...register("monthlyFee")}
                    type="number"
                    step="0.01"
                    placeholder="150.00"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                  {errors.monthlyFee && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.monthlyFee.message}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Valor por Hora-Aula (R$)
                  </label>
                  <input
                    {...register("hourlyRate")}
                    type="number"
                    step="0.01"
                    placeholder="50.00"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                  {errors.hourlyRate && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.hourlyRate.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg gradient-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting
                ? "Salvando..."
                : isEditing
                  ? "Atualizar"
                  : "Cadastrar"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/students")}
              className="rounded-lg border border-border bg-secondary px-6 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-accent"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
