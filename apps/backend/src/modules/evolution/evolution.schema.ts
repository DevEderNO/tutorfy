import { z } from 'zod';

export const createEvolutionEntrySchema = z.object({
  studentId: z.string().uuid('ID do aluno inválido'),
  classSessionId: z.string().uuid('ID da aula inválido').optional().nullable(),
  description: z.string().min(3, 'Descrição deve ter ao menos 3 caracteres'),
  categoryIds: z.array(z.string().uuid('ID de categoria inválido')).optional().default([]),
});

export const updateEvolutionEntrySchema = z.object({
  description: z.string().min(3, 'Descrição deve ter ao menos 3 caracteres').optional(),
  classSessionId: z.string().uuid('ID da aula inválido').optional().nullable(),
  categoryIds: z.array(z.string().uuid('ID de categoria inválido')).optional(),
});

export type CreateEvolutionEntryInput = z.infer<typeof createEvolutionEntrySchema>;
export type UpdateEvolutionEntryInput = z.infer<typeof updateEvolutionEntrySchema>;
