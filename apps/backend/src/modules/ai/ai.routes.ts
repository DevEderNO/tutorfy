import type { FastifyInstance } from 'fastify'
import { authGuard } from '../../lib/auth.js'
import { StudentEvolutionHandler } from './services/student-evolution/student-evolution.handler.js'
import { LessonPlanHandler } from './services/lesson-plan/lesson-plan.handler.js'

const studentEvolutionHandler = new StudentEvolutionHandler()
const lessonPlanHandler = new LessonPlanHandler()

export async function aiRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authGuard)

  app.post('/student-evolution/generate', studentEvolutionHandler.generate.bind(studentEvolutionHandler))
  app.post('/lesson-plan/generate', lessonPlanHandler.generate.bind(lessonPlanHandler))
}
