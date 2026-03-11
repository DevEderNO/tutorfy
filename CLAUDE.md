# Tutorfy - Regras do Projeto e Contexto do Assistente

Este arquivo define o contexto principal, o stack tecnológico, as restrições e as *Skills* necessárias para a manutenção e evolução do projeto **Tutorfy**.

## Sobre o Projeto

O Tutorfy é uma aplicação web de gestão e interação para aulas/tutorias. O sistema contempla o gerenciamento de alunos, turmas, lançamentos financeiros (pagamentos e faturas avulsas) e uploads de arquivos, além de autenticação própria e via Google OAuth.

## Stack Tecnológico

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

## Regras e Restrições de Manutenção

- **Tipagem Estrita:** Todo o código TypeScript (front e back) não deve utilizar `any`.
- **Validação de Ambiente (Fail-Fast):** Nenhuma variável de ambiente deve ser chamada diretamente por `process.env` no backend. Todo acesso deve passar pelo validador central `src/env.ts` utilizando Zod.
- **Integração de UI:** O Tailwind CSS deve ser a primeira opção de estilização. Evitar CSS customizado a menos que estritamente necessário (ex: animações complexas que não caibam no utilitário).
- **Tratamento de Erros:** O backend utiliza um Error Handler global no Fastify. Erros de regra de negócio devem lançar objetos contendo `{ statusCode, message }`.
- **Sem over-engineering:** Não adicionar abstrações, utilitários ou helpers para operações únicas. A solução mais simples que resolve o problema atual é sempre preferida.
- **Commits apenas quando solicitado:** Nunca criar commits sem que o usuário peça explicitamente.

## Padrões de UI/UX

- Design system: dark glassmorphism premium (backgrounds escuros, bordas translúcidas, gradientes sutis).
- Antes de implementar qualquer tela nova ou refatoração visual relevante, usar o **Stitch MCP** para gerar protótipos.

## Estrutura do Monorepo

```
apps/
  backend/   - API Fastify + Prisma
  web/       - React + Vite + Tailwind
packages/    - Pacotes compartilhados
```
