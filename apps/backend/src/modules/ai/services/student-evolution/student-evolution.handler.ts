import type { FastifyRequest, FastifyReply } from 'fastify'
import { StudentEvolutionAiService } from './student-evolution.service.js'
import { generateStudentEvolutionSchema } from './student-evolution.schema.js'
import { getUserId } from '../../../../lib/auth.js'

const service = new StudentEvolutionAiService()

export class StudentEvolutionHandler {
  async generate(request: FastifyRequest, reply: FastifyReply) {
    const parsed = generateStudentEvolutionSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Dados inválidos',
        errors: parsed.error.flatten().fieldErrors,
      })
    }

    const userId = getUserId(request)
    try {
      const result = await service.generateFromSession(parsed.data.classSessionId, userId)
      return reply.status(201).send({ data: result })
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string }
      return reply.status(err.statusCode || 500).send({ message: err.message })
    }
  }
}
