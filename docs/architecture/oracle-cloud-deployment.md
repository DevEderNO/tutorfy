# Deploy Oracle Cloud — Traefik + Docker

**Data:** 2026-05-27  
**Autor:** Eder  
**Status:** Aprovado — aguardando implementação

---

## Contexto

Migração do Tutorfy do Railway para uma VM Oracle Cloud (Ubuntu), usando Traefik como reverse proxy e Docker Compose para orquestração, com pipeline CI/CD via GitHub Actions.

**Servidor:** `137.131.183.49`  
**Domínio:** `devederno.com.br`

---

## Arquitetura

### URLs públicas

| App | URL |
|---|---|
| web | `https://tutorfyapp.devederno.com.br` |
| portal | `https://tutorfyportal.devederno.com.br` |
| backend | `https://tutorfyapi.devederno.com.br` |
| admin | interno apenas (sem rota pública) |

### Diagrama

```
Internet → Traefik (:80/:443)
             ├── tutorfyapp.devederno.com.br    → web (nginx :80)
             ├── tutorfyportal.devederno.com.br → portal (nginx :80)
             └── tutorfyapi.devederno.com.br    → backend (node :3333)

Rede interna Docker:
             ├── postgres (não exposto)
             └── admin (não exposto)
```

### Redes Docker

| Rede | Containers | Finalidade |
|---|---|---|
| `proxy` (external) | traefik, web, portal, backend | Tráfego externo via Traefik |
| `internal` (bridge) | backend, postgres, admin | Comunicação interna |

> O backend participa das duas redes: recebe tráfego externo e acessa o banco internamente.

### Fluxo de deploy

```
git push master
    → GitHub Actions
        → build 4 imagens Docker
        → push para ghcr.io
        → SSH no servidor
        → docker compose pull + up -d
```

---

## Arquivos de Configuração

### `traefik/traefik.yml`

```yaml
api:
  dashboard: false

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

providers:
  docker:
    exposedByDefault: false
    network: proxy

certificatesResolvers:
  letsencrypt:
    acme:
      email: sk9eder@gmail.com
      storage: /acme.json
      httpChallenge:
        entryPoint: web
```

### `docker-compose.yml`

```yaml
services:
  traefik:
    image: traefik:v3
    container_name: traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik/traefik.yml:/etc/traefik/traefik.yml:ro
      - ./traefik/acme.json:/acme.json
    networks:
      - proxy

  postgres:
    image: postgres:15-alpine
    container_name: tutorfy-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - tutorfy_pgdata:/var/lib/postgresql/data
    networks:
      - internal

  backend:
    image: ghcr.io/${GHCR_OWNER}/tutorfy-backend:latest
    container_name: tutorfy-backend
    restart: unless-stopped
    env_file: .env
    depends_on:
      - postgres
    networks:
      - proxy
      - internal
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`tutorfyapi.devederno.com.br`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
      - "traefik.http.services.backend.loadbalancer.server.port=3333"

  web:
    image: ghcr.io/${GHCR_OWNER}/tutorfy-web:latest
    container_name: tutorfy-web
    restart: unless-stopped
    environment:
      - PORT=80
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.web.rule=Host(`tutorfyapp.devederno.com.br`)"
      - "traefik.http.routers.web.entrypoints=websecure"
      - "traefik.http.routers.web.tls.certresolver=letsencrypt"
      - "traefik.http.services.web.loadbalancer.server.port=80"

  portal:
    image: ghcr.io/${GHCR_OWNER}/tutorfy-portal:latest
    container_name: tutorfy-portal
    restart: unless-stopped
    environment:
      - PORT=80
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portal.rule=Host(`tutorfyportal.devederno.com.br`)"
      - "traefik.http.routers.portal.entrypoints=websecure"
      - "traefik.http.routers.portal.tls.certresolver=letsencrypt"
      - "traefik.http.services.portal.loadbalancer.server.port=80"

  admin:
    image: ghcr.io/${GHCR_OWNER}/tutorfy-admin:latest
    container_name: tutorfy-admin
    restart: unless-stopped
    environment:
      - PORT=80
    networks:
      - internal

networks:
  proxy:
    external: true
  internal:
    driver: bridge

volumes:
  tutorfy_pgdata:
```

### `.env` (apenas no servidor — nunca no Git)

```env
POSTGRES_USER=tutorfy
POSTGRES_PASSWORD=TROQUE_POR_SENHA_FORTE
POSTGRES_DB=tutorfy
DATABASE_URL=postgresql://tutorfy:TROQUE_POR_SENHA_FORTE@postgres:5432/tutorfy
JWT_SECRET=TROQUE_POR_SECRET_FORTE
GOOGLE_CLIENT_ID=seu_google_client_id
GHCR_OWNER=DevEderNO
```

### `.github/workflows/deploy.yml`

```yaml
name: Build & Deploy

on:
  push:
    branches: [master]

env:
  REGISTRY: ghcr.io
  OWNER: ${{ github.repository_owner }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Login no GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build & Push backend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/backend/Dockerfile
          push: true
          tags: ghcr.io/${{ env.OWNER }}/tutorfy-backend:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build & Push web
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/web/Dockerfile
          push: true
          tags: ghcr.io/${{ env.OWNER }}/tutorfy-web:latest
          build-args: |
            VITE_API_URL=https://tutorfyapi.devederno.com.br
            VITE_GOOGLE_CLIENT_ID=${{ secrets.VITE_GOOGLE_CLIENT_ID }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build & Push portal
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/portal/Dockerfile
          push: true
          tags: ghcr.io/${{ env.OWNER }}/tutorfy-portal:latest
          build-args: |
            VITE_API_URL=https://tutorfyapi.devederno.com.br
            VITE_GOOGLE_CLIENT_ID=${{ secrets.VITE_GOOGLE_CLIENT_ID }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build & Push admin
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/admin/Dockerfile
          push: true
          tags: ghcr.io/${{ env.OWNER }}/tutorfy-admin:latest
          build-args: |
            VITE_API_URL=https://tutorfyapi.devederno.com.br
            VITE_GOOGLE_CLIENT_ID=${{ secrets.VITE_GOOGLE_CLIENT_ID }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest

    steps:
      - name: Deploy no servidor
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /opt/tutorfy
            echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            docker compose pull
            docker compose up -d --remove-orphans
            docker image prune -f
```

---

## Decision Log

| Decisão | Alternativas consideradas | Por quê |
|---|---|---|
| Traefik como reverse proxy | Nginx host, Coolify | SSL automático via Let's Encrypt, config via labels Docker, sem manutenção manual de certs |
| ghcr.io como registry | Docker Hub, ECR | Gratuito, integrado ao GitHub Actions sem conta externa |
| UFW para firewall | iptables direto | Mais simples no Ubuntu, mesma proteção |
| PostgreSQL em container | Banco gerenciado externo | Menor custo, suficiente para o volume atual |
| Build no GitHub Actions | Build no servidor | Servidor Oracle tem recursos limitados; CI é mais rápido e não trava o servidor |
| `PORT=80` via env no compose | Alterar nginx.conf.template | Menor mudança no código existente — aproveita o padrão Railway |

---

## Assumpcões

1. VM Oracle Cloud com Ubuntu já criada e acessível via SSH
2. DNS do domínio `devederno.com.br` pode ser editado pelo usuário
3. Repositório no GitHub em `github.com/DevEderNO/tutorfy`
4. Porta 3333 é a porta do backend (confirmada no Dockerfile: `EXPOSE ${PORT:-3333}`)
5. `admin` não precisa de acesso externo — acesso via SSH tunnel se necessário
