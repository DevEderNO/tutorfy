FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY . .

RUN pnpm install

# Variáveis de build do Vite (embutidas no bundle em build-time)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm --filter @tutorfy/portal run build

# Stage 2: Produção com nginx
FROM nginx:1.27-alpine AS runner

# envsubst para substituir variáveis no template nginx
RUN apk add --no-cache gettext

COPY --from=builder /app/apps/portal/dist /usr/share/nginx/html
COPY apps/portal/nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE ${PORT:-80}

# envsubst substitui API_URL e PORT no template antes do nginx iniciar
CMD ["sh", "-c", "envsubst '${API_URL} ${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
