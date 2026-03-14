import { z } from 'zod'

export const generateLessonPlanSchema = z.object({
  studentId: z.string().uuid(),
})

export type GenerateLessonPlanInput = z.infer<typeof generateLessonPlanSchema>
