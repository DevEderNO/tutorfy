# Lesson Plan AI — Design Document

## Understanding Summary

- **O que**: Serviço de IA `lesson-plan` que propõe um plano para a próxima aula com base no histórico recente do aluno
- **Por que**: Reduzir o tempo de preparação do tutor ao criar uma nova aula, aproveitando o contexto de sessões anteriores e da evolução registrada
- **Para quem**: O tutor, ao abrir o modal de nova aula
- **Dados analisados**: Últimas N aulas concluídas (N configurável, 1–3) + última entrada de evolução do aluno
- **Não-goals**: Não gera evolução (já existe); não falha se o aluno não tiver histórico

## Comportamento por Modo

| Modo | Comportamento |
|---|---|
| `OFF` | Nenhum |
| `AUTO` | Ao abrir o modal de nova aula, chama a IA e pré-preenche os campos configurados silenciosamente |
| `DEMAND` | Exibe botão "Gerar Plano" no formulário; ao clicar, abre modal de revisão onde o tutor edita antes de aplicar |

## Novas Configurações no User

| Campo | Tipo | Descrição |
|---|---|---|
| `lessonPlanAiMode` | `OFF \| AUTO \| DEMAND` | Modo de operação |
| `lessonPlanFields` | `String[]` | Campos a preencher: `content`, `homework`, `notes` |
| `lessonPlanSessionCount` | `Int` (1–3) | Número de sessões anteriores a analisar |

## Input/Output do Serviço

**Input (body):** `{ studentId: string }`

**Output:** `{ content?: string; homework?: string; notes?: string }` — apenas os campos configurados pelo usuário

## Arquitetura Backend

Segue o padrão existente de `student-evolution`:

```
apps/backend/src/modules/ai/services/lesson-plan/
  lesson-plan.handler.ts
  lesson-plan.service.ts
  lesson-plan.prompt.ts
  lesson-plan.schema.ts
```

**Novo endpoint:** `POST /api/ai/lesson-plan/generate`

**Fluxo interno do service:**
1. Busca `user.lessonPlanAiMode`, `lessonPlanFields`, `lessonPlanSessionCount`
2. Busca as últimas N `ClassSession` com status `COMPLETED` do aluno, ordenadas por data desc
3. Busca a última `EvolutionEntry` do aluno
4. Monta o prompt com o perfil do aluno + histórico de sessões + última evolução
5. Chama GPT-4o-mini com `response_format: json_object`
6. Retorna apenas os campos configurados em `lessonPlanFields`

## Arquitetura Frontend

- **SettingsPage** — nova seção "Plano de Aula por IA" em `6. Inteligência Artificial`:
  - Card `OFF / AUTO / DEMAND` (igual ao evolutionAiMode)
  - Checkboxes: Conteúdo, Tarefa, Notas
  - Slider: "Sessões analisadas" (1–3)
- **Modal de Nova Aula** (SchedulePage + DashboardPage):
  - Modo `AUTO`: chama o endpoint ao montar o modal com `studentId`, pré-preenche campos
  - Modo `DEMAND`: botão "✨ Gerar Plano" no formulário → abre modal de revisão → aplica ao form

## Assumptions

- `studentId` é o input; o serviço busca o histórico internamente
- Se houver menos de N sessões, usa as que existirem sem erro
- Latência do modo `AUTO` é aceitável (mesma ordem do `student-evolution`)
- Os campos padrão iniciais são `["content", "homework"]` e `sessionCount = 3`

## Decision Log

| Decisão | Alternativas | Motivo |
|---|---|---|
| Trigger: abrir modal de nova aula | Após concluir aula; sob demanda fora do modal | Contexto mais natural para o tutor preparar a próxima aula |
| Modo DEMAND retorna modal de revisão | Pré-preenche diretamente | Dá controle ao tutor antes de aplicar |
| N sessões configurável (slider 1–3) | Fixo em 3 | Tutores com alunos novos (< 3 sessões) ou que preferem foco na última aula |
| Campos configuráveis por checkbox | Sempre gerar todos | Tutores que não usam `notes` não precisam de sugestão nesse campo |
| Input: `studentId` (não `classSessionId`) | `classSessionId` da próxima aula | A próxima aula ainda não existe no momento da chamada |
