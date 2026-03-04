import { z } from 'zod';

export const classStatusEnum = z.enum(['SCHEDULED', 'COMPLETED', 'CANCELED', 'MISSED']);

export const createClassSchema = z.object({
  studentId: z.string().uuid('ID do aluno inválido'),
  date: z.string().min(1, 'Data é obrigatória'),
  startTime: z.string().min(1, 'Horário de início é obrigatório'),
  endTime: z.string().min(1, 'Horário de término é obrigatório'),
  status: classStatusEnum.optional().default('SCHEDULED'),
  content: z.string().optional(),
  homework: z.string().optional(),
  notes: z.string().optional(),
});

export const updateClassSchema = createClassSchema.partial();

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
