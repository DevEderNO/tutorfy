# Tutorfy

Um sistema web completo para controle e gestão de aulas particulares. Projetado no formato monorepo multi-portal para máxima reutilização de código e produtividade.

## Portais

| Portal | Pacote | Porta Dev | Descrição |
|--------|--------|-----------|-----------|
| Tutor | `apps/web` | 3000 | Interface principal para professores: alunos, agenda, financeiro, IA |
| Admin | `apps/admin` | 3001 | Gestão da plataforma: usuários, planos, financeiro, configurações globais |
| Portal do Aluno | `apps/portal` | 3002 | Acesso de alunos e responsáveis: evolução, agenda, extrato |

## Funcionalidades Principais

- **Gestão de Alunos**: Cadastro completo de estudantes, colégio, série e responsáveis.
- **Modelos de Cobrança Flexíveis (Dual Billing)**: Suporte para cobrança por *Mensalidade Fixa* ou *Valor por Hora-Aula*.
- **Controle de Agenda**: Agendamento de aulas com status detalhado (Agendada, Concluída, Cancelada, Falta).
- **Módulo Financeiro Automatizado**: Geração em lote de pagamentos do mês. Para alunos horistas, o sistema calcula as horas efetivamente dadas e gera o valor automaticamente.
- **Dashboard Resumo**: Visualização rápida de receitas, inadimplência, total de alunos e agenda semanal.
- **Inteligência Artificial**: Geração automática de registros de evolução e planos de aula com base no histórico.
- **Portal do Aluno/Responsável**: Acesso via link de convite ou conta própria para acompanhar evolução e extrato.
- **Painel Administrativo**: Gestão de planos SaaS, tutores, financeiro da plataforma e configurações globais.
- **Autenticação Multi-tenant**: Cada professor tem dados isolados; admins e portais têm tokens JWT discriminados por tipo.

---

## Stack Tecnológica

O projeto utiliza um ecossistema TypeScript end-to-end (Fullstack), orquestrado com **Turborepo** e **pnpm workspaces**.

- **Gerenciamento de Pacotes**: `pnpm`
- **Orquestração de Monorepo**: `Turborepo`
- **Front-ends (`apps/web`, `apps/admin`, `apps/portal`)**: React 19, Vite, TypeScript, TailwindCSS v4, React Query v5, React Hook Form + Zod.
- **Back-end (`apps/backend`)**: Node.js 20+, Fastify, TypeScript, Zod (validação).
- **Banco de Dados**: PostgreSQL + Prisma ORM.
- **Ambiente de Desenvolvimento**: Docker / Docker Compose.

---

## Pré-requisitos

Para rodar o projeto localmente, você precisará ter instalado na sua máquina:

- [Node.js](https://nodejs.org/pt-br/) (versão 20 ou superior)
- [pnpm](https://pnpm.io/pt/installation) (versão 9+)
- [Docker](https://www.docker.com/) e Docker Compose (para rodar o PostgreSQL)
- (Opcional) Git para controle de versão

---

## Começando (Getting Started)

Siga o passo a passo para rodar o projeto do zero na sua máquina local:

### 1. Clone o Repositório

```bash
git clone https://github.com/DevEderNO/tutorfy.git
cd tutorfy
```

### 2. Instalação de Dependências

Estando na raiz do projeto, instale todas as dependências do monorepo de uma só vez:

```bash
pnpm install
```

### 3. Configuração do Ambiente

Copie o arquivo de exemplo de variáveis de ambiente do backend e preencha os valores:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Variáveis obrigatórias em `apps/backend/.env`:

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL |
| `JWT_SECRET` | Chave secreta para assinar tokens JWT (mín. 10 chars) |
| `FRONTEND_URL` | URL do portal do tutor (`apps/web`) |
| `ADMIN_URL` | URL do painel admin (`apps/admin`) |
| `PORTAL_URL` | URL do portal do aluno (`apps/portal`) |
| `OPENAI_API_KEY` | Chave da OpenAI (opcional — necessário para recursos de IA) |
| `GOOGLE_CLIENT_ID` | Client ID do Google OAuth (opcional) |
| `ADMIN_SEED_EMAIL` | E-mail do primeiro super admin (usado no seed) |
| `ADMIN_SEED_PASSWORD` | Senha do primeiro super admin (usado no seed) |

Cada portal frontend tem seu próprio `.env`:

```bash
cp apps/admin/.env.example apps/admin/.env
cp apps/portal/.env.example apps/portal/.env
```

### 4. Configuração do Banco de Dados

Inicie o contêiner do PostgreSQL usando o Docker Compose na raiz do projeto:

```bash
docker compose up -d
```

O banco de dados estará rodando em `localhost:5432`.

### 5. Geração do Prisma e Envio do Schema

```bash
# Gera os tipos do Prisma Client
pnpm --filter @tutorfy/backend exec prisma generate

# Sincroniza o schema com o banco de dados
pnpm --filter @tutorfy/backend exec prisma db push
```

### 6. Seed Inicial

Popula o banco com o plano Free padrão e o primeiro super admin:

```bash
pnpm --filter @tutorfy/backend exec prisma db seed
```

> As credenciais do admin são definidas por `ADMIN_SEED_EMAIL` e `ADMIN_SEED_PASSWORD` no `.env`.

### 7. Inicie os Servidores de Desenvolvimento

Basta rodar o comando na raiz para subir todos os portais e o backend simultaneamente via Turborepo:

```bash
pnpm dev
```

**Você terá os seguintes serviços rodando:**

| Serviço | URL |
|---------|-----|
| Portal Tutor (`apps/web`) | http://localhost:3000 |
| Painel Admin (`apps/admin`) | http://localhost:3001 |
| Portal Aluno (`apps/portal`) | http://localhost:3002 |
| Backend (API) | http://localhost:3333 |

> **Nota de CORS:** No ambiente de desenvolvimento, cada frontend usa proxy Vite para `/api/*` → backend. Em produção, configure `FRONTEND_URL`, `ADMIN_URL` e `PORTAL_URL` no backend para permitir os domínios corretos.

### 8. Primeiro Acesso

**Tutor (`apps/web`):** Registre-se pela tela de cadastro ou use Google OAuth.

**Admin (`apps/admin`):** Use as credenciais definidas no seed (`ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`).

**Portal do Aluno (`apps/portal`):** Acesse via link de convite gerado pelo tutor (`/p/:token`) e crie sua conta.

---

## Arquitetura do Monorepo

```text
tutorfy/
├── apps/
│   ├── backend/             # Servidor Fastify API
│   │   ├── prisma/          # Schema do banco + seed
│   │   └── src/
│   │       ├── lib/         # Prisma Client, auth guards (tutor/admin/portal)
│   │       ├── modules/     # Módulos por domínio
│   │       │   ├── auth/    # Autenticação tutor (JWT + Google OAuth)
│   │       │   ├── admin/   # Módulos do painel admin
│   │       │   ├── portal/  # Módulos do portal aluno/responsável
│   │       │   ├── students/, classes/, payments/, ...
│   │       └── server.ts    # Ponto de entrada Fastify
│   ├── web/                 # Portal do tutor (React + Vite)
│   ├── admin/               # Painel administrativo (React + Vite)
│   └── portal/              # Portal aluno/responsável (React + Vite)
├── packages/
│   ├── config/              # tsconfig's base compartilhados
│   └── types/               # Tipos TypeScript, DTOs e Enums globais
├── docker-compose.yml       # Orquestração do Banco (PostgreSQL)
├── turbo.json               # Configuração do pipeline Turborepo
├── pnpm-workspace.yaml      # Configuração de workspaces
└── package.json             # Scripts root do monorepo
```

### Autenticação Multi-Portal

O backend usa discriminação por tipo no payload JWT:

| Portal | Tipo JWT | Guard |
|--------|----------|-------|
| Tutor (`apps/web`) | `{ id, type: "tutor" }` | `authGuard` |
| Admin (`apps/admin`) | `{ adminId, type: "admin", adminRole }` | `adminGuard` |
| Portal (`apps/portal`) | `{ portalAccountId, type: "portal", accountType }` | `portalGuard` |

Tokens existentes sem campo `type` são tratados como `"tutor"` (compatibilidade retroativa).

### Modelos de Dados Principais

- `User`: Tutor/professor (multi-tenant).
- `Student`: Aluno vinculado a um tutor.
- `ClassSession`: Registro de aula com status detalhado.
- `Payment`: Controle mensal de pagamento (mensal ou horista).
- `Plan`: Plano SaaS com limites de alunos e flag de IA.
- `Subscription`: Assinatura do tutor a um plano.
- `AdminUser`: Conta de acesso ao painel admin (`SUPER_ADMIN` ou `SUPPORT`).
- `PortalAccount`: Conta de acesso do aluno ou responsável ao portal.
- `StudentPortalLink`: Vínculo entre PortalAccount (STUDENT) e Student.
- `GuardianStudentLink`: Vínculo entre PortalAccount (GUARDIAN) e Student (cross-tutor).
- `AppSettings`: Configurações globais da plataforma (singleton).

---

## Comandos Disponíveis (Scripts)

Rodando a partir da raiz (Root):

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia todos os frontends e o backend em paralelo via Turborepo |
| `pnpm build` | Compila TypeScript e empacota todos os apps Vite |

Rodando a nível de pacote (Backend `/apps/backend`):

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Sobe a API separadamente com hot-reload |
| `pnpm db:push` | Sincroniza o schema Prisma com o banco sem migrations |
| `pnpm db:generate` | Regenera os tipos do Prisma Client |
| `pnpm db:seed` | Executa o seed (plano Free + primeiro super admin) |

---

## Implantação (Deployment)

Cada app é deployado de forma independente. Todos compartilham o mesmo backend.

### Frontends (Vercel / Netlify)

Os três apps (`web`, `admin`, `portal`) são SPAs estáticas. Para cada um:

1. Defina `VITE_API_URL` apontando para a URL do backend em produção.
2. Configure o root do build para `apps/web`, `apps/admin` ou `apps/portal`.
3. Comando de build: `pnpm build`, saída: `dist/`.

### Backend (Railway / Render / VPS)

O backend expõe a porta `3333`.

1. Defina todas as variáveis do `.env.example` no painel do provedor.
2. Configure `FRONTEND_URL`, `ADMIN_URL` e `PORTAL_URL` com os domínios reais de cada portal.
3. Execute `prisma db push` e `prisma db seed` no deploy inicial.
4. Comando de start: `node --loader ts-node/esm src/server.ts` ou compile com `tsc` e rode `node dist/server.js`.
