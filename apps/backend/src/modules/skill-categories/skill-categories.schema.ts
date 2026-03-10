import { z } from 'zod';

export const createSkillCategorySchema = z.object({
  name: z.string().min(1, 'Nome da categoria é obrigatório').max(100),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal (#RRGGBB)')
    .optional()
    .nullable(),
});

export const updateSkillCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal (#RRGGBB)')
    .optional()
    .nullable(),
});

export type CreateSkillCategoryInput = z.infer<typeof createSkillCategorySchema>;
export type UpdateSkillCategoryInput = z.infer<typeof updateSkillCategorySchema>;
