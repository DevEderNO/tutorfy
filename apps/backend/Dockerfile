FROM node:22-alpine AS builder

# Instalar libc6-compat (necessário para o turbo e prisma se usarem binários) e corepack
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copiar tudo
COPY . .

# Instalar dependências (incluindo workspace)
RUN pnpm install

# Gerar Prisma Client
RUN pnpm --filter @tutorfy/backend run db:generate

# Fazer o build do backend e das dependências locais (types)
RUN pnpm --filter @tutorfy/backend run build

# Stage 2: Produção (imagem mais limpa)
FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Em monorepos PNPM turborepo, uma abordagem simples para nuvem 
# é copiar a pasta toda já buildada e só rodar. 
# Para otimizar mais seria usar `turbo prune`, mas copiar o repositório 
# limpo de source pesado, ou simplesmente a pasta inteira buildada funciona bem no Railway.

COPY --from=builder /app /app

WORKDIR /app/apps/backend

# O Railway injeta a porta na variável de ambiente PORT. 
EXPOSE ${PORT:-3333}

# Comando de inicialização
CMD ["pnpm", "start"]
