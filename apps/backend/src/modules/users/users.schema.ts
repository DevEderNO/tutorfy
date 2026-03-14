import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').optional(),
  avatarUrl: z.string().nullable().optional(),
});

export const updateAiSettingsSchema = z.object({
  evolutionAiMode:        z.enum(['AUTO', 'REVIEW']).optional(),
  lessonPlanAiMode:       z.enum(['OFF', 'AUTO', 'DEMAND']).optional(),
  lessonPlanFields:       z.array(z.enum(['content', 'homework', 'notes'])).optional(),
  lessonPlanSessionCount: z.number().int().min(1).max(3).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateAiSettingsInput = z.infer<typeof updateAiSettingsSchema>;
