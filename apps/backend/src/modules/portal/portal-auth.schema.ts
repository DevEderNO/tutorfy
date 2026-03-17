import { z } from 'zod';

export const portalLoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const portalRegisterSchema = z.object({
  token: z.string().min(1, 'Token de convite é obrigatório'),
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  accountType: z.enum(['STUDENT', 'GUARDIAN']),
});

export const portalLinkStudentSchema = z.object({
  token: z.string().min(1, 'Token de convite é obrigatório'),
});

export type PortalLoginInput = z.infer<typeof portalLoginSchema>;
export type PortalRegisterInput = z.infer<typeof portalRegisterSchema>;
export type PortalLinkStudentInput = z.infer<typeof portalLinkStudentSchema>;
