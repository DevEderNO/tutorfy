import { z } from 'zod';

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  planSlug: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  search: z.string().optional(),
});

export const changePlanSchema = z.object({
  planId: z.string().min(1, 'planId é obrigatório'),
  period: z.enum(['MONTHLY', 'ANNUAL']).optional(),
});

export const changeStatusSchema = z.object({
  isActive: z.boolean(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type ChangePlanInput = z.infer<typeof changePlanSchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
