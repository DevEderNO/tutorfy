FROM node:22-alpine AS builder

RUN corepack enable pnpm
RUN apk add --no-cache libc6-compat

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

# Compila o frontend definindo a variável de ambiente para produção, se necessário
WORKDIR /app/apps/web
# Podemos passar VITE_API_URL por build arg, ou usar variável caso exista na config
RUN pnpm build

# Imagem de produção - servindo com Nginx
FROM nginx:alpine AS runner

# Copia os arquivos compilados do builder
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copia a configuração customizada do nginx para resolver rotas da SPA (React Router)
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
