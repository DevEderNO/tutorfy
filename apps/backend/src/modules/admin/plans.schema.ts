import { z } from 'zod';

export const createPlanSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  maxStudents: z.number().int().positive().nullable().optional(),
  aiEnabled: z.boolean().optional(),
  priceMonthly: z.number().min(0).optional(),
  priceAnnual: z.number().min(0).optional(),
});

export const updatePlanSchema = z.object({
  name: z.string().min(1).optional(),
  maxStudents: z.number().int().positive().nullable().optional(),
  aiEnabled: z.boolean().optional(),
  priceMonthly: z.number().min(0).optional(),
  priceAnnual: z.number().min(0).optional(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
