# AI Hub — Centralizador de IA

## Visão Geral

O **AI Hub** é um módulo backend que centraliza todos os serviços de inteligência artificial do Tutorfy. Ele atua como um gateway interno responsável por:

- Gerenciar a conexão com o provedor de IA (OpenAI)
- Encapsular a lógica de prompt engineering de cada serviço
- Fornecer logging e rastreabilidade de uso
- Expor endpoints REST organizados por domínio de serviço

## Localização no Monorepo

```
apps/backend/src/modules/ai/
  index.ts              — registro do módulo no Fastify
  ai.service.ts         — cliente OpenAI compartilhado
  ai.types.ts           — tipos e interfaces comuns
  services/
    student-evolution/
      student-evolution.handler.ts
      student-evolution.service.ts
      student-evolution.prompt.ts
      student-evolution.schema.ts
```

## Provedor

| Atributo     | Valor                        |
|--------------|------------------------------|
| Provedor     | OpenAI                       |
| Modelo       | `gpt-4o-mini`                |
| Autenticação | Chave única em `.env` (`OPENAI_API_KEY`) |
| SDK          | `openai` (npm)               |

## Configuração de Ambiente

```env
# .env
OPENAI_API_KEY=sk-...
```

## Serviços Disponíveis

| # | Serviço               | Endpoint                              | Status     |
|---|-----------------------|---------------------------------------|------------|
| 1 | Evolução do Aluno     | `POST /ai/student-evolution/generate` | Planejado  |

## Extensibilidade

Novos serviços devem seguir o padrão:

1. Criar pasta em `modules/ai/services/<nome-do-servico>/`
2. Implementar `handler`, `service` e `prompt` separados
3. Registrar a rota no `index.ts` do módulo AI
4. Documentar em `docs/features/ai-hub/services/<nome-do-servico>.md`
5. Atualizar a tabela de serviços acima
