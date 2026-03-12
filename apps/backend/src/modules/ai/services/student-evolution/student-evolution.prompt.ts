type PromptContext = {
  student: {
    name: string
    currentLevel: string | null
    strengths: string | null
    areasToImprove: string | null
    goals: string | null
  }
  session: {
    date: Date
    content: string | null
    homework: string | null
    notes: string | null
  }
  categories: { id: string; name: string }[]
}

const truncate = (text: string | null, max = 500): string =>
  text ? text.slice(0, max) : 'Não informado'

export function buildStudentEvolutionPrompt(ctx: PromptContext): string {
  const { student, session, categories } = ctx

  const date = new Date(session.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const categoryList =
    categories.length > 0
      ? categories.map((c) => `- ID: ${c.id} | Nome: ${c.name}`).join('\n')
      : 'Nenhuma categoria cadastrada'

  return `Você é um assistente especializado em acompanhamento pedagógico.
Analise as informações da aula abaixo e gere uma entrada de evolução do aluno.

PERFIL DO ALUNO:
- Nome: ${student.name}
- Nível atual: ${truncate(student.currentLevel)}
- Pontos fortes: ${truncate(student.strengths)}
- Áreas a melhorar: ${truncate(student.areasToImprove)}
- Objetivos: ${truncate(student.goals)}

DADOS DA AULA (${date}):
- Conteúdo trabalhado: ${truncate(session.content)}
- Tarefa passada: ${truncate(session.homework)}
- Observações do tutor: ${truncate(session.notes)}

CATEGORIAS DISPONÍVEIS:
${categoryList}

Gere uma descrição narrativa (máximo 300 palavras) sobre a evolução observada nesta aula.
Se houver categorias disponíveis, sugira quais se aplicam.

Responda APENAS com JSON válido neste formato exato:
{"description": "...", "suggestedCategoryIds": ["id1", "id2"]}`
}
