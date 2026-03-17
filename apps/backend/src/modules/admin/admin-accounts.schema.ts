import { z } from 'zod';

export const createAdminSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
  adminRole: z.enum(['SUPER_ADMIN', 'SUPPORT']),
});

export const updateAdminSchema = z.object({
  name: z.string().min(2).optional(),
  adminRole: z.enum(['SUPER_ADMIN', 'SUPPORT']).optional(),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
