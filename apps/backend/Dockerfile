FROM node:22-alpine AS builder

RUN corepack enable pnpm
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copia os manifestos e arquivos do workspace primeiro
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/

# Instala as dependências
RUN pnpm install --frozen-lockfile

# Copia o restante do código
COPY . .

# Gera o client do Prisma e compila o backend
WORKDIR /app/apps/backend
RUN npx prisma generate
WORKDIR /app
RUN pnpm --filter @tutorfy/backend build

# Imagem de produção
FROM node:22-alpine AS runner

RUN corepack enable pnpm
RUN apk add --no-cache openssl

WORKDIR /app

# Copia toda a pasta compilada do builder (necessário em monorepo simples sem turbo prune, para resolver workspaces)
COPY --from=builder /app /app

WORKDIR /app/apps/backend

ENV NODE_ENV=production
ENV PORT=3333

EXPOSE 3333

CMD ["pnpm", "start"]
