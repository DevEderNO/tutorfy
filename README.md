# Tutorfy

Um sistema web completo para controle e gestão de aulas particulares. Projetado no formato monorepo para máxima reutilização de código e produtividade.

## Funcionalidades Principais

- **Gestão de Alunos**: Cadastro completo de estudantes, colégio, série e responsáveis.
- **Modelos de Cobrança Flexíveis (Dual Billing)**: Suporte para cobrança por *Mensalidade Fixa* ou *Valor por Hora-Aula*.
- **Controle de Agenda**: Agendamento de aulas com status detalhado (Agendada, Concluída, Cancelada, Falta).
- **Módulo Financeiro Automatizado**: Geração em lote de pagamentos do mês. Para alunos horistas, o sistema calcula as horas efetivamente dadas e gera o valor automaticamente.
- **Dashboard Resumo**: Visualização rápida de receitas, inadimplência, total de alunos e agenda semanal.
- **Autenticação e Multi-tenant**: Sistema projetado com suporte a múltiplos usuários/professores, mantendo os dados isolados.

---

## Stack Tecnológica

O projeto utiliza um ecossistema TypeScript end-to-end (Fullstack), orquestrado com **Turborepo** e **pnpm workspaces**.

- **Gerenciamento de Pacotes**: `pnpm`
- **Orquestração de Monorepo**: `Turborepo`
- **Front-end (`apps/web`)**: React 19, Vite, TypeScript, TailwindCSS v4, shadcn/ui, React Query, React Hook Form + Zod.
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

### 3. Configuração do Banco de Dados

Inicie o contêiner do PostgreSQL usando o Docker Compose na raiz do projeto:

```bash
docker compose up -d
```

O banco de dados estará rodando em `localhost:5432`. As credenciais e o banco de dados já estarão configurados (`postgres` / `postgres` / `tutorfy`).

### 4. Geração do Prisma e Envio do Schema

Agora, entre na pasta do backend ou use os comandos do workspace para preparar o banco de dados:

```bash
# Gera os tipos do Prisma Client
pnpm --filter @tutorfy/backend exec prisma generate

# Sincroniza o schema com o banco de dados
pnpm --filter @tutorfy/backend exec prisma db push
```

### 5. Inicie o Servidor de Desenvolvimento

Basta rodar o comando na raiz para subir, via Turborepo, o Front-end e o Back-end simultaneamente:

```bash
pnpm dev
```

**Você terá os seguintes serviços rodando:**
- **Front-end**: [http://localhost:5173](http://localhost:5173)
- **Back-end (API)**: `http://localhost:3333`

> **Nota de CORS:** No ambiente de desenvolvimento, o front-end mapeia as chamadas de `/api/*` diretamente para o backend através da configuração de proxy no `vite.config.ts`. Isso resolve problemas de CORS nativamente sem configuração adicional.

### 6. Primeiro Uso (Registro)

1. Acesse o Front-end e veja a tela de Login.
2. Como não há tela de registro exposta no frontend (por decisão de design inicial), você deverá criar seu usuário via API:

```bash
curl -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Professora Maria",
    "email": "maria@tutorfy.com",
    "password": "senha_segura_123"
  }'
```

3. Volte para o navegador, faça o login com `maria@tutorfy.com` e a senha definida.

---

## Arquitetura do Monorepo

```text
tutorfy/
├── apps/
│   ├── backend/             # Servidor Fastify API
│   │   ├── prisma/          # Schema do banco de dados
│   │   └── src/             # Código-fonte do backend
│   │       ├── lib/         # Prisma Client e Wrappers de Autenticação JWT
│   │       ├── modules/     # Módulos de domínio (Auth, Students, Classes, Payments, Dashboard)
│   │       └── server.ts    # Ponto de entrada fastify
│   └── web/                 # Aplicação SPA React + Vite
│       └── src/
│           ├── components/  # Componentes globais (Layout, Sidebar)
│           ├── features/    # Features da aplicação (Dashboard, Students, etc.)
│           ├── lib/         # Configuração do Axios, utils
│           └── App.tsx      # Configuração de Rotas e Autenticação
├── packages/
│   ├── config/              # tsconfig's base compartilhados entre pacotes
│   └── types/               # Tipos TypeScript, DTOs e Enums globais do negócio
├── docker-compose.yml       # Orquestração do Banco (PostgreSQL)
├── turbo.json               # Configuração do pipeline de build (Turborepo)
├── pnpm-workspace.yaml      # Configuração de workspaces
└── package.json             # Scripts root do monorepo
```

### Arquitetura de Domínio de Dados
O banco de dados é gerido pelo **Prisma**. Abaixo o resumo das entidades principais:

- `User`: Professor/Usuário do sistema (Multi-tenant).
- `Student`: Controle do aluno. Contém chaves e parâmetros financeiros importantes (`billingType` configurado como `MONTHLY` ou `HOURLY`, além de `monthlyFee` e `hourlyRate`).
- `ClassSession`: Registro de aula, contendo a matéria e o status (`SCHEDULED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`).
- `Payment`: Controle mensal de pagamento. Se referente a método *HOURLY*, contém também o `classHours` referente às aulas associadas àquele boleto/recibo.

---

## Comandos Disponíveis (Scripts)

Rodando a partir da raiz (Root):

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia tanto a aplicação Front-end (`vite`) quanto o Back-end (`tsx watch`) em "paralelo" usando Turborepo. |
| `pnpm build` | Roda processos de build definidos nos pacotes, limpando cache quando aplicável. Valida Typescript e empacota Vite. |

Rodando a nível de pacote (Backend `/apps/backend`):

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Sobe a API separadamente, recarregando sob qualquer mudança. |
| `pnpm db:push` | Joga as mudanças de esquema atuais do `.prisma` para o seu DB local rodando. |
| `pnpm db:generate`| (Re)gera a tipagem estrita do Prisma baseada no banco atual. |

---

## Implantação (Deployment)

O monorepo está estruturado de forma modular e independente. Embora estejamos rodando ambos os contextos localmente usando o Vite Proxy, ao ir para PRD deve-se tomar as devidas ações para subida destas aplicações separadas:

### Front-end (Vercel, Netlify)

O app `web` exporta os assests estáticos perfeitamente num único output na pasta `apps/web/dist`.

1. Defina as variáveis de ambiente referentes à `VITE_API_URL` apontando para o seu Back-end em PRD.
2. Invoque o setup usando `pnpm install` para manter a garantia dos `packages/` compartilhados.
3. Defina a saída de build para `npm run build` ou `pnpm build`.

### Back-end (Railway, Render, VPS)

O `backend` expõe a porta `3333`.

1. Defina o `.env` ou variáveis do serviço como `DATABASE_URL` (Sua Connection String de Cloud DB, como Supabase ou AWS RDS) e o `JWT_SECRET` (Uma chave hash robusta e em string).
2. Configure o provedor com os comandos na root do `backend`, compilar (TypeScript) e subir os dados da tabela (`prisma db push` / migrações futuras, se geradas no workflow).
3. O serviço é rodado como em `npm start`, idealmente convertendo a saída TS para compilado ou rodando via ts-node / pm2 ou interpretadores modernos de nuvem.

### Atualizando Endereço de Proxy para o Deploy

Certifique-se de configurar as dependências de roteamento no App Vite, ou modifique `apps/web/src/lib/api.ts` substituindo para o modo de produção se necessário:

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});
```
