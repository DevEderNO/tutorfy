import type { FastifyRequest, FastifyReply } from 'fastify'
import { LessonPlanAiService } from './lesson-plan.service.js'
import { generateLessonPlanSchema } from './lesson-plan.schema.js'
import { getUserId } from '../../../../lib/auth.js'

const service = new LessonPlanAiService()

export class LessonPlanHandler {
  async generate(request: FastifyRequest, reply: FastifyReply) {
    const parsed = generateLessonPlanSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors:  parsed.error.flatten().fieldErrors,
      })
    }

    const userId = getUserId(request)
    try {
      const result = await service.generate(parsed.data.studentId, userId)
      return reply.status(200).send({ data: result })
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string }
      return reply.status(err.statusCode || 500).send({ message: err.message })
    }
  }
}
