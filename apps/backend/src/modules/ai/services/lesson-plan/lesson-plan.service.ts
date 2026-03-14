import { prisma } from '../../../../lib/prisma.js'
import { openai } from '../../ai.service.js'
import { buildLessonPlanPrompt } from './lesson-plan.prompt.js'
import type { LessonPlanResult } from '@tutorfy/types'

export class LessonPlanAiService {
  async generate(studentId: string, userId: string): Promise<LessonPlanResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        lessonPlanAiMode:       true,
        lessonPlanFields:       true,
        lessonPlanSessionCount: true,
      },
    })

    if (!user || user.lessonPlanAiMode === 'OFF') {
      throw { statusCode: 400, message: 'Plano de aula por IA está desativado' }
    }

    const student = await prisma.student.findFirst({
      where: { id: studentId, userId },
      select: {
        name:           true,
        currentLevel:   true,
        strengths:      true,
        areasToImprove: true,
        goals:          true,
      },
    })

    if (!student) {
      throw { statusCode: 404, message: 'Aluno não encontrado' }
    }

    const sessionCount = user.lessonPlanSessionCount ?? 3

    const [sessions, lastEvolution] = await Promise.all([
      prisma.classSession.findMany({
        where:   { studentId, userId, status: 'COMPLETED' },
        orderBy: { date: 'desc' },
        take:    sessionCount,
        select:  { date: true, startTime: true, endTime: true, content: true, homework: true, notes: true },
      }),
      prisma.evolutionEntry.findFirst({
        where:   { studentId },
        orderBy: { createdAt: 'desc' },
        select:  { description: true },
      }),
    ])

    const fields = user.lessonPlanFields.length > 0
      ? user.lessonPlanFields
      : ['content', 'homework']

    if (!openai) {
      throw { statusCode: 503, message: 'Serviço de IA não configurado (OPENAI_API_KEY ausente)' }
    }

    const prompt = buildLessonPlanPrompt({
      student,
      sessions,
      lastEvolution: lastEvolution?.description ?? null,
      fields,
    })

    const completion = await openai.chat.completions.create({
      model:           'gpt-4o-mini',
      messages:        [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature:     0.5,
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    return this.#parseResponse(raw, fields)
  }

  #parseResponse(raw: string, fields: string[]): LessonPlanResult {
    try {
      const data = JSON.parse(raw) as Record<string, unknown>
      const result: LessonPlanResult = {}
      for (const field of fields) {
        const value = data[field]
        if (typeof value === 'string' && value.trim()) {
          (result as Record<string, string>)[field] = value.trim()
        }
      }
      return result
    } catch {
      return {}
    }
  }
}
