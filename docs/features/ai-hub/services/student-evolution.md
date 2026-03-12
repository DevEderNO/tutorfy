# Serviço: Evolução do Aluno (Student Evolution)

## Objetivo

Gerar automaticamente uma entrada de evolução (`EvolutionEntry`) ao concluir uma aula (`ClassSession`), utilizando os dados da sessão e o perfil estático do aluno como contexto para a IA.

## Gatilho

O serviço é acionado quando uma `ClassSession` tem seu status alterado para `COMPLETED`.

O comportamento após o acionamento depende da configuração global do tutor:

| Modo          | Comportamento                                                                 |
|---------------|-------------------------------------------------------------------------------|
| `AUTO`        | A IA gera e persiste a `EvolutionEntry` automaticamente, sem interação.       |
| `REVIEW`      | A IA gera um rascunho e retorna ao frontend para revisão. O tutor confirma ou edita antes de salvar. |

## Configuração

A preferência de modo é armazenada por usuário (tutor) em um campo de configurações globais da conta.

```
Campo sugerido: User.aiSettings (JSON) ou tabela UserAiSettings
Valores: { evolutionMode: "AUTO" | "REVIEW" }
```

## Contexto enviado à IA

Para manter eficiência de tokens, o prompt usa apenas:

**Do aluno (`Student`):**
- `name`
- `currentLevel`
- `strengths`
- `areasToImprove`
- `goals`

**Da sessão (`ClassSession`):**
- `content` (conteúdo trabalhado na aula)
- `homework` (tarefa passada)
- `notes` (observações do tutor)
- `date`

**Das categorias do tutor (`SkillCategory[]`):**
- `id` + `name` (lista completa das categorias do tutor, para a IA sugerir quais aplicar)

Campos longos devem ser truncados a **500 caracteres** antes de compor o prompt.

## Saída esperada da IA

A IA deve retornar um JSON estruturado:

```json
{
  "notes": "Texto narrativo descrevendo a evolução observada na aula...",
  "suggestedCategoryIds": ["uuid-1", "uuid-2"]
}
```

## Fluxo de Dados

```
PATCH /classes/:id (status → COMPLETED)
  └─ ClassSession atualizada
       └─ AI Hub acionado (inline ou via evento)
            └─ Busca Student + SkillCategories do tutor
                 └─ Monta prompt
                      └─ Chama OpenAI (gpt-4o-mini)
                           └─ Modo AUTO → persiste EvolutionEntry
                           └─ Modo REVIEW → retorna rascunho ao frontend
```

## Endpoint

```
POST /ai/student-evolution/generate
```

### Request Body

```ts
{
  classSessionId: string  // UUID da sessão concluída
}
```

### Response (modo AUTO)

```ts
{
  evolutionEntryId: string  // UUID da entrada criada
}
```

### Response (modo REVIEW)

```ts
{
  draft: {
    notes: string
    suggestedCategoryIds: string[]
  }
}
```

## Persistência (modo AUTO e confirmação do REVIEW)

Cria um `EvolutionEntry` com:
- `studentId` — do aluno da sessão
- `classSessionId` — da sessão concluída
- `notes` — gerado pela IA
- `categories` — `suggestedCategoryIds` conectados via `EvolutionEntryCategory`

## Modelo de Prompt

```
Você é um assistente especializado em acompanhamento pedagógico.
Analise as informações da aula abaixo e gere:
1. Um texto narrativo (máx. 300 palavras) descrevendo a evolução observada.
2. Uma lista de IDs de categorias relevantes da lista fornecida.

PERFIL DO ALUNO:
- Nome: {student.name}
- Nível atual: {student.currentLevel}
- Pontos fortes: {student.strengths}
- Áreas a melhorar: {student.areasToImprove}
- Objetivos: {student.goals}

DADOS DA AULA ({session.date}):
- Conteúdo trabalhado: {session.content}
- Tarefa passada: {session.homework}
- Observações: {session.notes}

CATEGORIAS DISPONÍVEIS:
{categories.map(c => `- ID: ${c.id} | Nome: ${c.name}`).join('\n')}

Responda APENAS em JSON válido no formato:
{"notes": "...", "suggestedCategoryIds": ["id1", "id2"]}
```

## Tratamento de Erros

| Situação                          | Comportamento                                              |
|-----------------------------------|------------------------------------------------------------|
| OpenAI indisponível               | Log de erro, operação de conclusão da aula não é bloqueada |
| Resposta inválida (não-JSON)      | Log de erro, rascunho descartado silenciosamente           |
| Aluno sem perfil preenchido       | Gera evolução apenas com dados da sessão                   |
| Tutor sem categorias cadastradas  | `suggestedCategoryIds` retorna `[]`                        |

> **Regra crítica:** A falha do serviço de IA **nunca deve bloquear** a conclusão da aula.

## Estimativa de Custo por Chamada

| Item              | Estimativa          |
|-------------------|---------------------|
| Tokens de entrada | ~500–800 tokens     |
| Tokens de saída   | ~200–400 tokens     |
| Custo por chamada | ~$0,0002–$0,0005    |

## Dependências a Instalar

```bash
pnpm add openai --filter backend
```
