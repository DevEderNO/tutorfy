# Tutorfy - Regras do Projeto e Contexto do Assistente

Este arquivo define o contexto principal, o stack tecnológico, as restrições e as *Skills* necessárias para a manutenção e evolução do projeto **Tutorfy**.

## 🎯 Sobre o Projeto (Tutorfy)
O Tutorfy é uma aplicação web de gestão e interação para aulas/tutorias. O sistema contempla o gerenciamento de alunos, turmas, lançamentos financeiros (pagamentos e faturas avulsas) e uploads de arquivos, além de autenticação própria e via Google OAuth.

## 🛠 Stack Tecnológico
**Arquitetura:** Monorepo (TurboRepo/pnpm)

**Frontend (`apps/web`):**
- React 18+ com TypeScript
- Vite como bundler
- Tailwind CSS v4 para estilização
- Consumo de API via endpoints `/api` (Proxy no ambiente de desenvolvimento)

**Backend (`apps/backend`):**
- Node.js com TypeScript
- Fastify (com pacotes `@fastify/cors`, `@fastify/jwt`, `@fastify/multipart`)
- Prisma ORM
- PostgreSQL
- Autenticação: JWT interno e Google OAuth (`google-auth-library`)
- Validação de ambiente: Zod

## 🧠 Skills do Assistente Necessárias (Ativar Conforme o Contexto)

Para trabalhar neste repositório com excelência, o assistente deve invocar seletivamente as seguintes habilidades (Skills) pertencentes ao seu catálogo:

1. **`backend-architect` & `nodejs-backend-patterns`**
   - **Gatilho:** Quando criar novos serviços no Fastify, estruturar rotas ou definir integrações e padrões arquiteturais do backend.
2. **`frontend-developer` & `typescript-expert`**
   - **Gatilho:** Ao criar componentes React, gerenciar tipagens globais ou lidar com lógicas de interface usando Tailwind.
3. **`prisma-expert` & `postgresql`**
   - **Gatilho:** Quando for necessário alterar o *schema.prisma*, realizar integrações de banco de dados, lidar com migrações ou debugar queries lentas.
4. **`database-architect`**
   - **Gatilho:** Para modelar novas entidades (ex: sistema de agendamento de aulas).
5. **`security-auditor` & `backend-security-coder`**
   - **Gatilho:** Para blindar integrações como uploads, proteção contra XSS, CSRF ou validar segredos sensíveis como o JWT e OAuth.
6. **Módulo Stitch MCP (`@modelcontextprotocol/server-stitch`) para UI/UX**
   - **Gatilho:** OBRIGATÓRIO em toda e qualquer tarefa que envolva criação, refinamento, idealização ou discussão de telas, fluxos de usuário (UI/UX), protótipos e ajustes de front-end visual. Use-o para gerar design systems semânticos e gerar telas base antes da implementação em código.

## 🚧 Regras e Restrições de Manutenção
- **Tipagem Estrita:** Todo o código TypeScript (front e back) não deve utilizar `any`.
- **Validação de Ambiente (Fail-Fast):** Nenhuma variável de ambiente deve ser chamada diretamente por `process.env` no backend. Todo acesso deve passar pelo validador central `src/env.ts` utilizando Zod.
- **Integração de UI:** O Tailwind CSS deve ser a primeira opção de estilização. Evitar CSS customizado a menos que estritamente necessário (ex: animações complexas que não caibam no utilitário).
- **Tratamento de Erros:** O backend utiliza um Error Handler global no Fastify. Erros de regra de negócio devem lançar objetos contendo `{ statusCode, message }`.

---
*Nota ao Agente: Sempre que iniciar uma tarefa complexa no Tutorfy, revise as skills apontadas acima.*
