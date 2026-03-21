import { z } from 'zod';

const billingTypeEnum = z.enum(['MONTHLY', 'HOURLY']);

const schedulePreferenceSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário de início inválido (HH:mm)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário de término inválido (HH:mm)'),
});

export const createStudentSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  avatarUrl: z.string().optional().nullable(),
  grade: z.string().min(1, 'Série é obrigatória'),
  school: z.string().min(1, 'Escola é obrigatória'),
  responsibleName: z.string().optional().nullable(),
  responsiblePhone: z.string().optional().nullable(),
  guardianIds: z.array(z.string()).optional(),
  billingType: billingTypeEnum.default('MONTHLY'),
  monthlyFee: z.number().min(0, 'Valor da mensalidade não pode ser negativo').optional().default(0),
  hourlyRate: z.number().positive('Valor por hora deve ser positivo').optional().nullable(),
  cpf: z.string().optional().nullable(),
  email: z.string().email('E-mail inválido').optional().nullable().or(z.literal('')),
  birthDate: z.string().optional().nullable(),
  shift: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  schedulePreferences: z.array(schedulePreferenceSchema).optional(),
  // Avaliação Inicial
  currentLevel: z.string().max(500).optional().nullable(),
  strengths: z.string().max(2000).optional().nullable(),
  areasToImprove: z.string().max(2000).optional().nullable(),
  goals: z.string().max(2000).optional().nullable(),
  initialObservations: z.string().max(5000).optional().nullable(),
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
  avatarUrl: z.string().optional().nullable(),
  grade: z.string().min(1).optional(),
  school: z.string().min(1).optional(),
  responsibleName: z.string().optional().nullable(),
  responsiblePhone: z.string().optional().nullable(),
  guardianIds: z.array(z.string()).optional(),
  billingType: billingTypeEnum.optional(),
  monthlyFee: z.number().min(0).optional(),
  hourlyRate: z.number().positive().optional().nullable(),
  active: z.boolean().optional(),
  cpf: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  birthDate: z.string().optional().nullable(),
  shift: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  schedulePreferences: z.array(schedulePreferenceSchema).optional(),
  // Avaliação Inicial
  currentLevel: z.string().max(500).optional().nullable(),
  strengths: z.string().max(2000).optional().nullable(),
  areasToImprove: z.string().max(2000).optional().nullable(),
  goals: z.string().max(2000).optional().nullable(),
  initialObservations: z.string().max(5000).optional().nullable(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export const listStudentsQuerySchema = z.object({
  page:        z.coerce.number().min(1).default(1),
  limit:       z.coerce.number().min(1).max(100).default(10),
  search:      z.string().optional(),
  active:      z.enum(['true', 'false']).optional(),
  billingType: z.enum(['MONTHLY', 'HOURLY']).optional(),
  sortBy:      z.enum(['name', 'school', 'grade', 'monthlyFee', 'createdAt']).default('name'),
  sortDir:     z.enum(['asc', 'desc']).default('asc'),
});

export type ListStudentsQuery = z.infer<typeof listStudentsQuerySchema>;
