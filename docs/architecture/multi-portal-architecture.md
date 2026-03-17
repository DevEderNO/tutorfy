# Arquitetura Multi-Portal — Tutorfy

## Visão Geral

O Tutorfy está sendo dividido em **3 portais independentes**, cada um como uma aplicação React separada no monorepo, compartilhando um único backend Fastify.

| Portal | App | URL esperada | Perfis |
|---|---|---|---|
| Administrativo | `apps/admin` | `admin.tutorfy.com` | `super_admin`, `support` |
| Tutor | `apps/web` | `app.tutorfy.com` | `tutor` |
| Aluno/Responsável | `apps/portal` | `portal.tutorfy.com` | `student`, `guardian` |

---

## Decision Log

| # | Decisão | Alternativas consideradas | Motivo |
|---|---|---|---|
| 1 | 3 apps React separadas no monorepo | App única com rotas por role | Isolamento de build/deploy, independência de times |
| 2 | Entidades de acesso separadas (`AdminUser`, `PortalAccount`) | Tabela única com discriminador de role; herança com tabelas de extensão | Schema limpo sem campos nullable; ciclos de vida e regras de negócio distintos |
| 3 | JWT por portal com `type` discriminador | JWT único com role | Guards explícitos, sem risco de vazamento de contexto entre portais |
| 4 | Backend único com módulos por portal | Backends separados; API gateway | Complexidade operacional mínima para o estágio atual |
| 5 | Tutor se registra livremente no plano free | Aprovação manual pelo admin | Menor fricção de onboarding; admin controla limites via plano |
| 6 | `PortalAccount` com relação N:N entre responsável e alunos de tutores diferentes | Responsável vinculado a um único tutor | Responsável pode ter filhos com diferentes tutores |
| 7 | Pagamentos no portal: visualização agora, gateway no futuro | Integração imediata | Foco em MVP; arquitetura preparada para extensão |

---

## Arquitetura de Dados

### Modelo atual (preservado)

```prisma
model User {
  // tutores — sem alterações no modelo existente
  id                    String   @id @default(uuid())
  email                 String   @unique
  password              String?
  googleId              String?
  name                  String
  avatarUrl             String?
  evolutionAiMode       EvolutionAiMode
  lessonPlanAiMode      LessonPlanAiMode
  lessonPlanFields      String[]
  lessonPlanSessionCount Int     @default(3)
  createdAt             DateTime @default(now())

  students              Student[]
  classSessions         ClassSession[]
  payments              Payment[]
  passwordResetTokens   PasswordResetToken[]
  skillCategories       SkillCategory[]
  subscription          Subscription?
}
```

### Novos modelos

```prisma
// ─── Planos e Assinaturas ─────────────────────────────────────────────────────

model Plan {
  id              String         @id @default(uuid())
  name            String         // ex: "Free", "Pro", "Premium"
  slug            String         @unique // ex: "free", "pro", "premium"
  maxStudents     Int?           // null = ilimitado
  aiEnabled       Boolean        @default(false)
  priceMonthly    Float          @default(0)
  priceAnnual     Float          @default(0)
  isActive        Boolean        @default(true)
  createdAt       DateTime       @default(now())

  subscriptions   Subscription[]
}

model Subscription {
  id              String             @id @default(uuid())
  userId          String             @unique
  planId          String
  period          SubscriptionPeriod // MONTHLY | ANNUAL
  status          SubscriptionStatus // ACTIVE | CANCELED | PAST_DUE | TRIALING
  startedAt       DateTime           @default(now())
  expiresAt       DateTime?
  canceledAt      DateTime?

  user            User               @relation(fields: [userId], references: [id])
  plan            Plan               @relation(fields: [planId], references: [id])
}

enum SubscriptionPeriod {
  MONTHLY
  ANNUAL
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
  TRIALING
}

// ─── Portal Administrativo ────────────────────────────────────────────────────

model AdminUser {
  id              String          @id @default(uuid())
  email           String          @unique
  password        String
  name            String
  adminRole       AdminRole
  isActive        Boolean         @default(true)
  createdAt       DateTime        @default(now())
  lastLoginAt     DateTime?
}

enum AdminRole {
  SUPER_ADMIN   // acesso total
  SUPPORT       // visualização de usuários e suporte; sem acesso financeiro
}

// ─── Portal do Aluno / Responsável ───────────────────────────────────────────

model PortalAccount {
  id              String              @id @default(uuid())
  email           String              @unique
  password        String?             // null enquanto não criou conta (acesso por token)
  name            String
  accountType     PortalAccountType
  isActive        Boolean             @default(true)
  createdAt       DateTime            @default(now())
  lastLoginAt     DateTime?

  // Relação N:N com Student via tabelas de vínculo
  guardianLinks   GuardianStudentLink[] // preenchido se accountType = GUARDIAN
  studentLink     StudentPortalLink?    // preenchido se accountType = STUDENT
}

enum PortalAccountType {
  STUDENT
  GUARDIAN
}

// Vincula responsável (PortalAccount GUARDIAN) a um ou mais alunos (cross-tutor)
model GuardianStudentLink {
  id              String        @id @default(uuid())
  guardianId      String
  studentId       String
  createdAt       DateTime      @default(now())

  guardian        PortalAccount @relation(fields: [guardianId], references: [id])
  student         Student       @relation(fields: [studentId], references: [id])

  @@unique([guardianId, studentId])
}

// Vincula aluno (Student) à sua conta no portal (PortalAccount STUDENT)
model StudentPortalLink {
  id              String        @id @default(uuid())
  portalAccountId String        @unique
  studentId       String        @unique
  createdAt       DateTime      @default(now())

  portalAccount   PortalAccount @relation(fields: [portalAccountId], references: [id])
  student         Student       @relation(fields: [studentId], references: [id])
}
```

> **Nota:** O modelo `Student` existente precisa receber as relações reversas:
> ```prisma
> // Adicionar em model Student:
> guardianLinks   GuardianStudentLink[]
> studentLink     StudentPortalLink?
> ```

---

## Arquitetura de Autenticação

### Fluxo por portal

```
apps/admin  → POST /api/admin/auth/login  → JWT { adminId, type: "admin", adminRole }
apps/web    → POST /api/auth/login        → JWT { userId, type: "tutor" }  (atual)
apps/portal → POST /api/portal/auth/login → JWT { portalAccountId, type: "portal", accountType }
```

### Guards no backend

```typescript
// Guard existente — verificar type = "tutor"
authGuard(request) → verifica JWT, extrai userId

// Novo guard para admin
adminGuard(request, adminRole?) → verifica type = "admin", opcionalmente adminRole

// Novo guard para portal
portalGuard(request, accountType?) → verifica type = "portal", opcionalmente accountType
```

### Fluxo de convite/acesso ao portal (híbrido)

```
1. Tutor gera share token para o aluno (StudentShareToken — já existe)
2. Responsável/aluno acessa /p/:token (já existe — visualização pública)
3. Na tela do portal público, botão "Criar conta" ou "Entrar"
4. Se novo: criar PortalAccount + vínculo (GuardianStudentLink ou StudentPortalLink)
5. Se existente: vincular novo aluno à conta existente
6. Após login: JWT de portal emitido
```

---

## Estrutura do Monorepo (após implementação)

```
apps/
  backend/          ← API única, novos módulos por portal
    src/
      modules/
        auth/       ← auth de tutor (atual)
        admin/      ← auth + CRUD admin
          admin-auth.routes.ts
          plans.routes.ts
          subscriptions.routes.ts
          admin-users.routes.ts (tutores)
          admin-financial.routes.ts
        portal/     ← auth + leitura para aluno/responsável
          portal-auth.routes.ts
          portal-students.routes.ts
          portal-payments.routes.ts
        students/   ← atual
        classes/    ← atual
        payments/   ← atual
        ...
  web/              ← portal tutor (atual, mínimas alterações)
  admin/            ← novo portal admin (React + Vite + Tailwind)
  portal/           ← novo portal aluno/responsável (React + Vite + Tailwind)
packages/
  types/            ← tipos compartilhados entre apps e backend
```

---

## Escopo do Portal Admin (`apps/admin`)

### Módulos

| Módulo | Funcionalidades | Acesso |
|---|---|---|
| **Usuários** | Listar tutores, ver detalhes, ativar/desativar, alterar plano | super_admin, support (read-only) |
| **Planos** | CRUD de planos, definir limites e preços | super_admin |
| **Assinaturas** | Ver assinaturas ativas, histórico, cancelamentos | super_admin, support (read-only) |
| **Financeiro** | Receita MRR/ARR, inadimplência, exportação | super_admin |
| **Admins** | Gerenciar contas de admin (criar, desativar, alterar role) | super_admin |
| **Configurações globais** | Feature flags, mensagens do sistema, limites padrão | super_admin |

---

## Escopo do Portal Aluno/Responsável (`apps/portal`)

### Módulos

| Módulo | Funcionalidades | Acesso |
|---|---|---|
| **Evolução** | Ver registros de progresso do aluno | student, guardian |
| **Agenda** | Próximas aulas e histórico | student, guardian |
| **Financeiro** | Extrato de pagamentos/faturas (leitura) | guardian |
| **Perfil** | Editar dados da conta do portal | student, guardian |
| **Alunos vinculados** | Lista de filhos vinculados (responsável multi-tutor) | guardian |

---

## Premissas

1. `apps/web` não é refatorado nesta fase — apenas recebe subscription awareness (bloquear features além do plano)
2. Cada app tem seu próprio `vite.config.ts` e `index.html`
3. O `StudentShareToken` existente é o mecanismo de convite para o portal
4. Tutores registrados antes desta feature entram automaticamente no plano free (migration seed)
5. Financeiro do responsável é leitura — pagamentos online são fase futura
6. Plano free tem limites a definir em sessão separada com o produto

---

## Não está no escopo desta fase

- Integração com gateway de pagamento (Stripe, Asaas, etc.)
- Sub-permissões granulares além de `super_admin` / `support`
- App mobile nativa
- Notificações push / e-mail transacional (além do existente)
- Multi-idioma
