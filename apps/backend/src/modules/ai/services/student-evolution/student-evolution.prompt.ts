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
    startTime: string | null
    endTime: string | null
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
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const horario = session.startTime
    ? session.endTime
      ? `${session.startTime} – ${session.endTime}`
      : session.startTime
    : 'Não informado'

  const categoryList =
    categories.length > 0
      ? categories.map((c) => `- ID: ${c.id} | Nome: ${c.name}`).join('\n')
      : 'Nenhuma categoria cadastrada'

  return `Você é um assistente especializado em acompanhamento pedagógico.
Analise as informações da aula abaixo e gere um relatório de evolução do aluno em formato Markdown.

PERFIL DO ALUNO:
- Nome: ${student.name}
- Nível atual: ${truncate(student.currentLevel)}
- Pontos fortes: ${truncate(student.strengths)}
- Áreas a melhorar: ${truncate(student.areasToImprove)}
- Objetivos: ${truncate(student.goals)}

DADOS DA AULA (${date}):
- Horário: ${horario}
- Conteúdo trabalhado: ${truncate(session.content)}
- Tarefa passada: ${truncate(session.homework)}
- Observações do tutor: ${truncate(session.notes)}

CATEGORIAS DISPONÍVEIS:
${categoryList}

Gere o relatório seguindo EXATAMENTE esta estrutura Markdown:

# Relatório de Aula

**Aluno:** [nome do aluno]
**Data da aula:** [data por extenso]
**Horário:** [horário]
**Conteúdo:** [resumo do conteúdo em uma linha]

---

## Conteúdo Trabalhado
[Parágrafo descritivo com lista de tópicos trabalhados]

---

## Desenvolvimento da Aula
[Parágrafo sobre como o aluno se comportou e progrediu durante a aula]

---

## Observações
[Pontos positivos, dificuldades e aspectos relevantes observados]

---

## Considerações Pedagógicas
[Análise pedagógica com recomendações para as próximas aulas]

Use negrito para destacar pontos importantes. Escreva em português brasileiro formal. Seja específico com base nas informações fornecidas.
Se houver categorias disponíveis, sugira quais se aplicam a esta aula.

Responda APENAS com JSON válido neste formato exato:
{"description": "...", "suggestedCategoryIds": ["id1", "id2"]}`
}
