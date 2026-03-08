FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copiar arquivos do monorepo
COPY . .

# Instalar dependências
RUN pnpm install

# Injetar variáveis de ambiente para o build do Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Buildar o frontend (Vite)
RUN pnpm --filter @tutorfy/web run build

# Stage 2: Nginx
FROM nginx:alpine AS runner

# Copiar build do React
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copiar arquivo de template do nginx
COPY apps/web/nginx.conf.template /etc/nginx/templates/default.conf.template

# O script entrypoint padrão da imagem do nginx alpino executa envsubst 
# nos arquivos .template dentro de /etc/nginx/templates/ gerando o default.conf.
# Então apenas precisamos expor as portas adequadas (Railway sobrescreve EXPOSE limit, 
# contanto que o Nginx escute em $PORT).

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
