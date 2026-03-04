import { z } from 'zod';

const billingTypeEnum = z.enum(['MONTHLY', 'HOURLY']);

export const createStudentSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  grade: z.string().min(1, 'Série é obrigatória'),
  school: z.string().min(1, 'Escola é obrigatória'),
  responsibleName: z.string().min(2, 'Nome do responsável é obrigatório'),
  responsiblePhone: z.string().min(8, 'Telefone inválido'),
  billingType: billingTypeEnum.default('MONTHLY'),
  monthlyFee: z.number().min(0, 'Valor da mensalidade não pode ser negativo').optional().default(0),
  hourlyRate: z.number().positive('Valor por hora deve ser positivo').optional().nullable(),
}).refine(
  (data) => {
    if (data.billingType === 'MONTHLY') return (data.monthlyFee ?? 0) > 0;
    return true;
  },
  { message: 'Mensalidade é obrigatória para cobrança mensal', path: ['monthlyFee'] },
).refine(
  (data) => {
    if (data.billingType === 'HOURLY') return data.hourlyRate != null && data.hourlyRate > 0;
    return true;
  },
  { message: 'Valor por hora é obrigatório para cobrança por hora', path: ['hourlyRate'] },
);

export const updateStudentSchema = z.object({
  name: z.string().min(2).optional(),
  grade: z.string().min(1).optional(),
  school: z.string().min(1).optional(),
  responsibleName: z.string().min(2).optional(),
  responsiblePhone: z.string().min(8).optional(),
  billingType: billingTypeEnum.optional(),
  monthlyFee: z.number().min(0).optional(),
  hourlyRate: z.number().positive().optional().nullable(),
  active: z.boolean().optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
