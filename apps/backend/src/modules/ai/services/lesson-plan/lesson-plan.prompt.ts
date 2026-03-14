type SessionSummary = {
  date: Date
  startTime: string | null
  endTime:   string | null
  content:   string | null
  homework:  string | null
  notes:     string | null
}

type PromptContext = {
  student: {
    name:           string
    currentLevel:   string | null
    strengths:      string | null
    areasToImprove: string | null
    goals:          string | null
  }
  sessions:      SessionSummary[]
  lastEvolution: string | null
  fields:        string[]
}

const truncate = (text: string | null, max = 600): string =>
  text ? text.slice(0, max) : 'Não informado'

const fieldLabels: Record<string, string> = {
  content:  'content (conteúdo a trabalhar na próxima aula)',
  homework: 'homework (tarefa a passar para o aluno)',
  notes:    'notes (observações ou orientações para o tutor)',
}

export function buildLessonPlanPrompt(ctx: PromptContext): string {
  const { student, sessions, lastEvolution, fields } = ctx

  const sessionsSummary = sessions.length > 0
    ? sessions.map((s, i) => {
        const date = new Date(s.date).toLocaleDateString('pt-BR', {
          day: 'numeric', month: 'long', year: 'numeric',
        })
        return `Aula ${i + 1} (${date}):
  - Conteúdo: ${truncate(s.content)}
  - Tarefa passada: ${truncate(s.homework)}
  - Observações: ${truncate(s.notes)}`
      }).join('\n\n')
    : 'Nenhuma aula anterior registrada.'

  const requestedFields = fields
    .filter((f) => fieldLabels[f])
    .map((f) => `  "${f}": "${fieldLabels[f]}"`)
    .join(',\n')

  return `Você é um assistente pedagógico especializado em tutoria individual.
Com base no perfil do aluno, no histórico das aulas anteriores e na última entrada de evolução, proponha um plano para a próxima aula.

PERFIL DO ALUNO:
- Nome: ${student.name}
- Nível atual: ${truncate(student.currentLevel)}
- Pontos fortes: ${truncate(student.strengths)}
- Áreas a melhorar: ${truncate(student.areasToImprove)}
- Objetivos: ${truncate(student.goals)}

HISTÓRICO DE AULAS ANTERIORES (mais recentes primeiro):
${sessionsSummary}

ÚLTIMA ENTRADA DE EVOLUÇÃO:
${truncate(lastEvolution, 800)}

INSTRUÇÕES:
- Analise o que foi trabalhado e as dificuldades identificadas.
- Proponha o que faz mais sentido abordar na próxima aula, dando continuidade ao progresso.
- Seja específico, prático e pedagógico.
- Escreva em português brasileiro formal e conciso.

Responda APENAS com JSON válido contendo exatamente os campos solicitados:
{
${requestedFields}
}`
}
