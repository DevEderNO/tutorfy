import { z } from 'zod'

export const generateStudentEvolutionSchema = z.object({
  classSessionId: z.string().uuid('ID da aula inválido'),
})

export type GenerateStudentEvolutionInput = z.infer<typeof generateStudentEvolutionSchema>
