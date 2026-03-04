import { z } from 'zod';

export const createPaymentSchema = z.object({
  studentId: z.string().uuid('ID do aluno inválido'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  amount: z.number().positive('Valor deve ser positivo'),
  billingType: z.enum(['MONTHLY', 'HOURLY']).optional().default('MONTHLY'),
  classHours: z.number().min(0).optional().nullable(),
});

export const markPaidSchema = z.object({
  paid: z.boolean(),
});

export const generatePaymentsSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type MarkPaidInput = z.infer<typeof markPaidSchema>;
export type GeneratePaymentsInput = z.infer<typeof generatePaymentsSchema>;
