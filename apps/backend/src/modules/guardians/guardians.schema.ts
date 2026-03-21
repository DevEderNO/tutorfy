import { z } from 'zod';

export const createGuardianSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cpf: z.string().optional(),
  notes: z.string().optional(),
});

export const updateGuardianSchema = createGuardianSchema.partial().extend({
  studentLinks: z
    .array(z.object({ id: z.string(), relationship: z.string().optional() }))
    .optional(),
});

export const listGuardiansQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt']).default('name'),
  sortDir: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateGuardianInput = z.infer<typeof createGuardianSchema>;
export type UpdateGuardianInput = z.infer<typeof updateGuardianSchema>;
export type ListGuardiansQuery = z.infer<typeof listGuardiansQuerySchema>;
