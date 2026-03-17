# Tasks — Implementação Multi-Portal

> **Documento de referência:** `docs/architecture/multi-portal-architecture.md`
> **Última atualização:** 2026-03-17
> **Status geral:** 🔴 Não iniciado

---

## Como usar este documento

- Marque tarefas com ✅ ao concluir
- Marque com 🔄 quando em progresso
- Marque com ❌ se bloqueada (adicione o motivo)
- Ao retomar sessão, leia o status geral e continue pela primeira tarefa não concluída

---

## FASE 1 — Fundação do Schema e Auth (Backend)

> **Objetivo:** Preparar o banco de dados e o backend para suportar os 3 portais.
> **Pode ser feito sem tocar no frontend.**

### 1.1 — Prisma Schema

- [ ] **1.1.1** Adicionar modelo `Plan` no `schema.prisma`
- [ ] **1.1.2** Adicionar modelo `Subscription` no `schema.prisma`
- [ ] **1.1.3** Adicionar enum `SubscriptionPeriod` (MONTHLY | ANNUAL)
- [ ] **1.1.4** Adicionar enum `SubscriptionStatus` (ACTIVE | CANCELED | PAST_DUE | TRIALING)
- [ ] **1.1.5** Adicionar modelo `AdminUser` no `schema.prisma`
- [ ] **1.1.6** Adicionar enum `AdminRole` (SUPER_ADMIN | SUPPORT)
- [ ] **1.1.7** Adicionar modelo `PortalAccount` no `schema.prisma`
- [ ] **1.1.8** Adicionar enum `PortalAccountType` (STUDENT | GUARDIAN)
- [ ] **1.1.9** Adicionar modelo `GuardianStudentLink` no `schema.prisma`
- [ ] **1.1.10** Adicionar modelo `StudentPortalLink` no `schema.prisma`
- [ ] **1.1.11** Adicionar relações reversas no modelo `Student` existente (`guardianLinks`, `studentLink`)
- [ ] **1.1.12** Adicionar relação `subscription` no modelo `User` existente

### 1.2 — Migration e Seed

- [ ] **1.2.1** Gerar migration: `pnpm prisma migrate dev --name add-multi-portal`
- [ ] **1.2.2** Criar seed para plano "Free" padrão (limites a definir com produto)
- [ ] **1.2.3** Criar migration para vincular todos os `User` existentes ao plano Free (`Subscription` com status ACTIVE)
- [ ] **1.2.4** Criar seed para primeiro `AdminUser` com role `SUPER_ADMIN` (via variável de ambiente `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`)
- [ ] **1.2.5** Atualizar `.env.example` com `ADMIN_SEED_EMAIL` e `ADMIN_SEED_PASSWORD`

### 1.3 — Auth Guards no Backend

- [ ] **1.3.1** Refatorar `authGuard` existente para injetar `type: "tutor"` no payload JWT ao login do tutor
- [ ] **1.3.2** Criar `adminGuard`: valida JWT com `type: "admin"`, extrai `adminId` e `adminRole`
- [ ] **1.3.3** Criar `portalGuard`: valida JWT com `type: "portal"`, extrai `portalAccountId` e `accountType`
- [ ] **1.3.4** Criar helper `requireAdminRole(adminRole: AdminRole)` para usar dentro de rotas (ex: só `SUPER_ADMIN` acessa `/admin/plans`)
- [ ] **1.3.5** Adicionar o tipo `type` na geração do JWT em `auth.service.ts` (tutor login)

### 1.4 — Módulo de Auth Admin

- [ ] **1.4.1** Criar `apps/backend/src/modules/admin/admin-auth.routes.ts`
- [ ] **1.4.2** Implementar `POST /api/admin/auth/login` — autenticar `AdminUser`, retornar JWT com `type: "admin"` e `adminRole`
- [ ] **1.4.3** Implementar `GET /api/admin/auth/me` — retornar dados do admin autenticado (protegido por `adminGuard`)
- [ ] **1.4.4** Registrar rotas no `server.ts`

### 1.5 — Módulo de Auth Portal

- [ ] **1.5.1** Criar `apps/backend/src/modules/portal/portal-auth.routes.ts`
- [ ] **1.5.2** Implementar `POST /api/portal/auth/login` — autenticar `PortalAccount` por e-mail/senha, retornar JWT
- [ ] **1.5.3** Implementar `POST /api/portal/auth/register` — criar `PortalAccount` via invite token (`StudentShareToken`), vincular ao aluno e/ou responsável
  - Validar token existente e não expirado
  - Criar `PortalAccount` com accountType inferido
  - Criar `StudentPortalLink` (STUDENT) ou `GuardianStudentLink` (GUARDIAN)
- [ ] **1.5.4** Implementar `POST /api/portal/auth/link-student` — adicionar novo aluno a uma conta GUARDIAN existente via token (protegido por `portalGuard`)
- [ ] **1.5.5** Implementar `GET /api/portal/auth/me` — retornar dados da conta portal autenticada
- [ ] **1.5.6** Registrar rotas no `server.ts`

---

## FASE 2 — Módulos do Portal Admin (Backend)

> **Objetivo:** Expor endpoints para todas as funcionalidades do portal admin.

### 2.1 — Gestão de Planos

- [ ] **2.1.1** Criar `apps/backend/src/modules/admin/plans.routes.ts`
- [ ] **2.1.2** `GET /api/admin/plans` — listar todos os planos (`adminGuard`)
- [ ] **2.1.3** `POST /api/admin/plans` — criar plano (`adminGuard` + `SUPER_ADMIN`)
- [ ] **2.1.4** `PUT /api/admin/plans/:id` — editar plano (`adminGuard` + `SUPER_ADMIN`)
- [ ] **2.1.5** `DELETE /api/admin/plans/:id` — desativar plano, não deletar (soft delete via `isActive`) (`adminGuard` + `SUPER_ADMIN`)

### 2.2 — Gestão de Usuários (Tutores)

- [ ] **2.2.1** Criar `apps/backend/src/modules/admin/admin-users.routes.ts`
- [ ] **2.2.2** `GET /api/admin/users` — listar tutores com paginação, filtro por plano e status (`adminGuard`)
- [ ] **2.2.3** `GET /api/admin/users/:id` — detalhes de um tutor (alunos, assinatura, uso) (`adminGuard`)
- [ ] **2.2.4** `PATCH /api/admin/users/:id/plan` — alterar plano de um tutor (`adminGuard` + `SUPER_ADMIN`)
- [ ] **2.2.5** `PATCH /api/admin/users/:id/status` — ativar/desativar conta de tutor (`adminGuard` + `SUPER_ADMIN`)

### 2.3 — Gestão de Admins

- [ ] **2.3.1** Criar `apps/backend/src/modules/admin/admin-accounts.routes.ts`
- [ ] **2.3.2** `GET /api/admin/admins` — listar contas admin (`adminGuard` + `SUPER_ADMIN`)
- [ ] **2.3.3** `POST /api/admin/admins` — criar conta admin (`adminGuard` + `SUPER_ADMIN`)
- [ ] **2.3.4** `PATCH /api/admin/admins/:id` — editar nome/role de admin (`adminGuard` + `SUPER_ADMIN`)
- [ ] **2.3.5** `DELETE /api/admin/admins/:id` — desativar conta admin, não deletar (`adminGuard` + `SUPER_ADMIN`)

### 2.4 — Financeiro da Plataforma

- [ ] **2.4.1** Criar `apps/backend/src/modules/admin/admin-financial.routes.ts`
- [ ] **2.4.2** `GET /api/admin/financial/summary` — MRR, ARR, total de assinantes por plano (`adminGuard` + `SUPER_ADMIN`)
- [ ] **2.4.3** `GET /api/admin/financial/subscriptions` — listar assinaturas com filtros (status, período, plano) (`adminGuard` + `SUPER_ADMIN`)

### 2.5 — Configurações Globais

- [ ] **2.5.1** Criar `apps/backend/src/modules/admin/admin-settings.routes.ts`
- [ ] **2.5.2** `GET /api/admin/settings` — retornar configurações globais (`adminGuard`)
- [ ] **2.5.3** `PUT /api/admin/settings` — salvar configurações globais (`adminGuard` + `SUPER_ADMIN`)
- [ ] **2.5.4** Definir schema de configurações globais (a detalhar com produto — ex: feature flags)

---

## FASE 3 — Módulos do Portal Aluno/Responsável (Backend)

> **Objetivo:** Expor endpoints para o portal de acesso ao aluno/responsável.

### 3.1 — Dados do Aluno

- [ ] **3.1.1** Criar `apps/backend/src/modules/portal/portal-students.routes.ts`
- [ ] **3.1.2** `GET /api/portal/students` — listar alunos vinculados à conta (portalGuard)
  - STUDENT: retorna o seu próprio aluno
  - GUARDIAN: retorna todos os filhos (cross-tutor)
- [ ] **3.1.3** `GET /api/portal/students/:studentId` — detalhes de um aluno vinculado (validar vínculo)

### 3.2 — Evolução e Agenda

- [ ] **3.2.1** Criar `apps/backend/src/modules/portal/portal-evolution.routes.ts`
- [ ] **3.2.2** `GET /api/portal/students/:studentId/evolution` — registros de evolução do aluno (portalGuard)
- [ ] **3.2.3** `GET /api/portal/students/:studentId/classes` — histórico e próximas aulas (portalGuard)

### 3.3 — Financeiro do Responsável

- [ ] **3.3.1** Criar `apps/backend/src/modules/portal/portal-payments.routes.ts`
- [ ] **3.3.2** `GET /api/portal/students/:studentId/payments` — extrato de pagamentos/faturas (portalGuard, somente GUARDIAN)

---

## FASE 4 — App Admin (`apps/admin`)

> **Objetivo:** Criar a aplicação React do portal administrativo.

### 4.1 — Setup do Projeto

- [ ] **4.1.1** Criar `apps/admin/` com `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`
- [ ] **4.1.2** Configurar Tailwind CSS v4 com `@theme` (reutilizar tokens do `apps/web` via `packages/`)
- [ ] **4.1.3** Adicionar `apps/admin` ao `pnpm-workspace.yaml` e `turbo.json`
- [ ] **4.1.4** Instalar dependências: React 19, react-router-dom v7, @tanstack/react-query v5, lucide-react, tailwind-variants
- [ ] **4.1.5** Copiar/referenciar componentes da UI library para o admin (decidir: copiar ou extrair para `packages/ui`)
- [ ] **4.1.6** Criar estrutura de pastas: `src/features/`, `src/components/`, `src/lib/`

### 4.2 — Auth do Admin

- [ ] **4.2.1** Criar `AdminAuthContext` (similar ao `AuthContext` do web)
- [ ] **4.2.2** Criar `LoginPage` do admin (e-mail + senha, sem Google OAuth)
- [ ] **4.2.3** Criar `ProtectedAdminRoute` — redireciona para login se não autenticado
- [ ] **4.2.4** Criar `ProtectedSuperAdminRoute` — redireciona se role != SUPER_ADMIN
- [ ] **4.2.5** Configurar rotas base: `/login`, `/` (dashboard), `/users`, `/plans`, `/admins`, `/financial`, `/settings`

### 4.3 — Layout

- [ ] **4.3.1** Criar `AdminLayout` com sidebar e header
- [ ] **4.3.2** Sidebar com links: Dashboard, Usuários, Planos, Financeiro, Admins, Configurações
- [ ] **4.3.3** Itens de Financeiro, Admins e Configurações visíveis somente para `SUPER_ADMIN`

### 4.4 — Telas

- [ ] **4.4.1** `DashboardPage` — métricas gerais: total tutores, assinantes por plano, MRR
- [ ] **4.4.2** `UsersListPage` — tabela de tutores com busca, filtro por plano/status, paginação
- [ ] **4.4.3** `UserDetailPage` — detalhes do tutor: dados, assinatura atual, contagem de alunos, ações (alterar plano, ativar/desativar)
- [ ] **4.4.4** `PlansPage` — CRUD de planos (somente SUPER_ADMIN)
- [ ] **4.4.5** `FinancialPage` — resumo MRR/ARR e lista de assinaturas (somente SUPER_ADMIN)
- [ ] **4.4.6** `AdminsPage` — gerenciar contas de admin (somente SUPER_ADMIN)
- [ ] **4.4.7** `SettingsPage` — configurações globais (somente SUPER_ADMIN)

---

## FASE 5 — App Portal (`apps/portal`)

> **Objetivo:** Criar a aplicação React do portal aluno/responsável.

### 5.1 — Setup do Projeto

- [ ] **5.1.1** Criar `apps/portal/` com `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`
- [ ] **5.1.2** Configurar Tailwind CSS v4 com `@theme`
- [ ] **5.1.3** Adicionar `apps/portal` ao `pnpm-workspace.yaml` e `turbo.json`
- [ ] **5.1.4** Instalar dependências (mesmo stack do `apps/web`)
- [ ] **5.1.5** Criar estrutura de pastas: `src/features/`, `src/components/`, `src/lib/`

### 5.2 — Auth do Portal

- [ ] **5.2.1** Criar `PortalAuthContext`
- [ ] **5.2.2** Criar fluxo de acesso por token (link mágico `/invite/:token`)
  - Validar token via API
  - Se `PortalAccount` não existe: redirecionar para registro
  - Se existe: login automático e redirecionar para o portal
- [ ] **5.2.3** Criar `RegisterPage` — criar conta a partir do invite token (nome, e-mail, senha)
- [ ] **5.2.4** Criar `LoginPage` — e-mail + senha para contas já criadas
- [ ] **5.2.5** Criar `ProtectedPortalRoute`

### 5.3 — Layout

- [ ] **5.3.1** Criar `PortalLayout` — navbar simples com nome do aluno/responsável e logout
- [ ] **5.3.2** Se GUARDIAN: seletor de aluno no header (para alternar entre filhos)

### 5.4 — Telas

- [ ] **5.4.1** `HomePage` — visão geral: próximas aulas, último registro de evolução
- [ ] **5.4.2** `EvolutionPage` — lista de registros de evolução do aluno selecionado
- [ ] **5.4.3** `SchedulePage` — agenda de aulas (histórico + futuras)
- [ ] **5.4.4** `FinancialPage` — extrato de pagamentos/faturas (somente GUARDIAN)
- [ ] **5.4.5** `ProfilePage` — editar nome, e-mail, senha da conta do portal
- [ ] **5.4.6** `StudentsPage` — listar filhos vinculados e adicionar novo via token (somente GUARDIAN)

### 5.5 — Migração do Portal Público Existente

- [ ] **5.5.1** Avaliar rota pública existente `/p/:token` em `apps/web`
- [ ] **5.5.2** Adicionar botão "Criar conta" / "Entrar" na `StudentPortalPage` apontando para `apps/portal`
- [ ] **5.5.3** Manter `/p/:token` funcionando para acesso anônimo (não quebrar link compartilhado)

---

## FASE 6 — Subscription Awareness no Portal do Tutor (`apps/web`)

> **Objetivo:** O portal do tutor passa a respeitar os limites do plano contratado.

- [ ] **6.1** Criar endpoint `GET /api/users/subscription` — retornar plano atual e limites do tutor autenticado
- [ ] **6.2** Adicionar `subscription` ao contexto de auth do `apps/web`
- [ ] **6.3** Bloquear criação de novo aluno quando `students.length >= plan.maxStudents` (exibir modal de upgrade)
- [ ] **6.4** Bloquear features de IA quando `plan.aiEnabled === false`
- [ ] **6.5** Criar `UpgradeModal` — informar limite atingido e orientar para upgrade (contato/admin por ora)

---

## FASE 7 — Infraestrutura e Deploy

- [ ] **7.1** Definir estratégia de deploy para as 3 apps (Vercel / Render / VPS)
- [ ] **7.2** Configurar variáveis de ambiente por portal (`VITE_API_URL` em cada app)
- [ ] **7.3** Configurar CORS no backend para aceitar origens dos 3 portais
- [ ] **7.4** Atualizar `README.md` com instruções de setup das novas apps
- [ ] **7.5** Atualizar `.env.example` com todas as novas variáveis necessárias

---

## Ordem de Execução Recomendada

```
FASE 1 (Backend: schema + auth guards)
  ↓
FASE 2 (Backend: módulos admin)
  ↓
FASE 3 (Backend: módulos portal)
  ↓
FASE 4 (Frontend: apps/admin)    ←→    FASE 5 (Frontend: apps/portal)   [paralelo]
  ↓
FASE 6 (Subscription awareness em apps/web)
  ↓
FASE 7 (Infra e deploy)
```

---

## Dependências e Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Migração do campo `type` no JWT pode quebrar sessões ativas de tutores | Alto | Fazer deploy do backend com compatibilidade retroativa (aceitar tokens sem `type` como `"tutor"`) |
| Modelo de planos free não definido com produto | Médio | Usar limites placeholder (ex: 10 alunos, sem IA) e ajustar via admin após launch |
| `apps/admin` e `apps/portal` sem design definido no Figma | Médio | Usar Stitch MCP para gerar protótipos antes de implementar cada tela |
| Responsável vinculado a alunos de tutores diferentes pode expor dados de um tutor a outro | Alto | `portalGuard` deve validar o vínculo em cada request; nunca retornar dados sem checar `GuardianStudentLink` |
