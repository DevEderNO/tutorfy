import { z } from 'zod';

export const appSettingsConfigSchema = z.object({
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().optional(),
  newRegistrationsEnabled: z.boolean().optional(),
  defaultPlanSlug: z.string().optional(),
  aiGloballyEnabled: z.boolean().optional(),
});

export const updateSettingsSchema = z.object({
  config: appSettingsConfigSchema,
});

export type AppSettingsConfig = z.infer<typeof appSettingsConfigSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
