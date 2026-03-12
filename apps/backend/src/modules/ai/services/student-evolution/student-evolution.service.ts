import { prisma } from '../../../../lib/prisma.js';
import { openai } from '../../ai.service.js';
import { buildStudentEvolutionPrompt } from './student-evolution.prompt.js';

type GenerateResult =
  | { mode: 'AUTO'; evolutionEntryId: string }
  | { mode: 'REVIEW'; draft: { description: string; suggestedCategoryIds: string[] } }

export class StudentEvolutionAiService {
  async generateFromSession(classSessionId: string, userId: string): Promise<GenerateResult> {
    const session = await prisma.classSession.findFirst({
      where: { id: classSessionId, userId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            currentLevel: true,
            strengths: true,
            areasToImprove: true,
            goals: true,
          },
        },
      },
    })

    if (!session) {
      throw { statusCode: 404, message: 'Aula não encontrada' }
    }

    const [categories, user] = await Promise.all([
      prisma.skillCategory.findMany({
        where: { userId },
        select: { id: true, name: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { evolutionAiMode: true },
      }),
    ])

    const prompt = buildStudentEvolutionPrompt({
      student: session.student,
      session: {
        date: session.date,
        content: session.content,
        homework: session.homework,
        notes: session.notes,
      },
      categories,
    })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const parsed = this.#parseResponse(raw)

    const validCategoryIds = categories
      .map((c) => c.id)
      .filter((id) => parsed.suggestedCategoryIds.includes(id))

    const mode = user?.evolutionAiMode ?? 'AUTO'

    if (mode === 'REVIEW') {
      return {
        mode: 'REVIEW',
        draft: {
          description: parsed.description,
          suggestedCategoryIds: validCategoryIds,
        },
      }
    }

    const entry = await prisma.evolutionEntry.create({
      data: {
        studentId: session.student.id,
        classSessionId: session.id,
        description: parsed.description,
        categories:
          validCategoryIds.length > 0
            ? { create: validCategoryIds.map((categoryId) => ({ categoryId })) }
            : undefined,
      },
    })

    return { mode: 'AUTO', evolutionEntryId: entry.id }
  }

  #parseResponse(raw: string): { description: string; suggestedCategoryIds: string[] } {
    try {
      const data = JSON.parse(raw) as unknown
      if (
        typeof data === 'object' &&
        data !== null &&
        'description' in data &&
        typeof (data as { description: unknown }).description === 'string'
      ) {
        const typed = data as { description: string; suggestedCategoryIds?: unknown }
        const ids = Array.isArray(typed.suggestedCategoryIds)
          ? typed.suggestedCategoryIds.filter((id): id is string => typeof id === 'string')
          : []
        return { description: typed.description, suggestedCategoryIds: ids }
      }
    } catch {
      // fallthrough to default
    }
    return { description: '', suggestedCategoryIds: [] }
  }
}
