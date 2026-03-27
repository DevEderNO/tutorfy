import { z } from 'zod';

export const fileTypeEnum = z.enum(['TAREFA', 'MATERIAL', 'TRABALHO', 'OUTRO']);

export const createStudentFileSchema = z.object({
  type:           fileTypeEnum,
  title:          z.string().min(1).max(100),
  url:            z.string().url('URL inválida'),
  classSessionId: z.string().optional(),
});

export const listStudentFilesSchema = z.object({
  classSessionId: z.string().optional(),
});

export type CreateStudentFileInput = z.infer<typeof createStudentFileSchema>;
export type ListStudentFilesQuery  = z.infer<typeof listStudentFilesSchema>;
