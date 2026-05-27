# Deploy Oracle Cloud — Traefik + Docker

**Data:** 2026-05-27  
**Autor:** Eder  
**Status:** ✅ Implementado e operacional

---

## Contexto

Migração do Tutorfy do Railway para uma VM Oracle Cloud (Ubuntu), usando Traefik como reverse proxy e Docker Compose para orquestração, com pipeline CI/CD via GitHub Actions.

**Servidor:** `137.131.183.49` (Oracle Cloud — Ampere A1, ARM64)  
**OS:** Ubuntu  
**Domínio:** `devederno.com.br` (registrado na Hostinger, DNS gerenciado pela Cloudflare)

---

## Arquitetura

### URLs públicas

| App | URL |
|---|---|
| web | `https://tutorfyapp.devederno.com.br` |
| portal | `https://tutorfyportal.devederno.com.br` |
| backend | `https://tutorfyapi.devederno.com.br` |
| portainer | `https://portainer.devederno.com.br` |
| admin | interno apenas (sem rota pública) |

### Diagrama

```
Internet → Traefik (:80/:443)
             ├── tutorfyapp.devederno.com.br    → web (nginx :80)
             ├── tutorfyportal.devederno.com.br → portal (nginx :80)
             ├── tutorfyapi.devederno.com.br    → backend (node :3333)
             └── portainer.devederno.com.br     → portainer (:9000)

Rede interna Docker:
             ├── postgres (não exposto)
             └── admin (não exposto)
```

### Redes Docker

| Rede | Containers | Finalidade |
|---|---|---|
| `proxy` (external) | traefik, web, portal, backend, portainer | Tráfego externo via Traefik |
| `internal` (bridge) | backend, postgres, admin | Comunicação interna |

> O backend participa das duas redes: recebe tráfego externo e acessa o banco internamente.

### Fluxo de deploy

```
git push master
    → GitHub Actions
        → build 4 imagens Docker (linux/amd64 + linux/arm64)
        → push para ghcr.io/devederno/
        → SSH no servidor
        → docker compose pull + up -d
```

---

## Configuração DNS (Cloudflare)

Registros tipo **A** com **Somente DNS** (nuvem cinza — proxy desativado):

| Nome | IP |
|---|---|
| `tutorfyapp` | `137.131.183.49` |
| `tutorfyportal` | `137.131.183.49` |
| `tutorfyapi` | `137.131.183.49` |
| `portainer` | `137.131.183.49` |

> ⚠️ **Manter proxy Cloudflare DESATIVADO** (nuvem cinza) para esses subdomínios.  
> Com proxy ativo (nuvem laranja), o Let's Encrypt HTTP challenge falha e o Traefik não consegue emitir certificados SSL.

---

## GitHub Actions Secrets

| Secret | Descrição |
|---|---|
| `SERVER_HOST` | `137.131.183.49` |
| `SERVER_USER` | `ubuntu` |
| `SERVER_SSH_KEY` | Conteúdo da chave privada SSH |
| `SERVER_SSH_PASSPHRASE` | Passphrase da chave SSH (se protegida) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID |

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

  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer.rule=Host(`portainer.devederno.com.br`)"
      - "traefik.http.routers.portainer.entrypoints=websecure"
      - "traefik.http.routers.portainer.tls.certresolver=letsencrypt"
      - "traefik.http.services.portainer.loadbalancer.server.port=9000"

networks:
  proxy:
    external: true
  internal:
    driver: bridge

volumes:
  tutorfy_pgdata:
  portainer_data:
```

### `.env` (apenas no servidor — nunca no Git)

```env
POSTGRES_USER=tutorfy
POSTGRES_PASSWORD=SENHA_FORTE_AQUI
POSTGRES_DB=tutorfy
DATABASE_URL=postgresql://tutorfy:SENHA_FORTE_AQUI@postgres:5432/tutorfy
JWT_SECRET=SECRET_FORTE_AQUI
GOOGLE_CLIENT_ID=seu_google_client_id
GHCR_OWNER=devederno
```

> ⚠️ `GHCR_OWNER` deve ser **obrigatoriamente lowercase** (`devederno`, não `DevEderNO`). O ghcr.io rejeita tags com letras maiúsculas.

### `.github/workflows/deploy.yml`

```yaml
name: Build & Deploy

on:
  push:
    branches:
      - master

env:
  REGISTRY: ghcr.io

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Converter owner para lowercase
        run: echo "OWNER=$(echo '${{ github.repository_owner }}' | tr '[:upper:]' '[:lower:]')" >> $GITHUB_ENV

      - name: Login no GitHub Container Registry
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
          platforms: linux/amd64,linux/arm64
          tags: ghcr.io/${{ env.OWNER }}/tutorfy-backend:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build & Push web
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/web/Dockerfile
          push: true
          platforms: linux/amd64,linux/arm64
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
          platforms: linux/amd64,linux/arm64
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
          platforms: linux/amd64,linux/arm64
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
      - name: Converter owner para lowercase
        run: echo "OWNER=$(echo '${{ github.repository_owner }}' | tr '[:upper:]' '[:lower:]')" >> $GITHUB_ENV

      - name: Deploy no servidor Oracle Cloud
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          passphrase: ${{ secrets.SERVER_SSH_PASSPHRASE }}
          script: |
            cd /opt/tutorfy
            echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            sed -i 's/GHCR_OWNER=.*/GHCR_OWNER=devederno/' .env
            docker compose pull
            docker compose up -d --remove-orphans
            docker image prune -f
```

---

## Comandos de Manutenção

```bash
# Ver status dos containers
docker compose -f /opt/tutorfy/docker-compose.yml ps

# Ver logs de um serviço
docker compose -f /opt/tutorfy/docker-compose.yml logs -f backend

# Reiniciar um serviço
docker compose -f /opt/tutorfy/docker-compose.yml restart backend

# Subir manualmente após alteração no servidor
cd /opt/tutorfy && docker compose pull && docker compose up -d --remove-orphans
```

---

## Decision Log

| Decisão | Alternativas consideradas | Por quê |
|---|---|---|
| Traefik como reverse proxy | Nginx host, Coolify | SSL automático via Let's Encrypt, config via labels Docker, sem manutenção manual de certs |
| ghcr.io como registry | Docker Hub, ECR | Gratuito, integrado ao GitHub Actions sem conta externa |
| UFW para firewall | iptables direto | Mais simples no Ubuntu, mesma proteção |
| PostgreSQL em container | Banco gerenciado externo | Menor custo, suficiente para o volume atual |
| Build no GitHub Actions | Build no servidor | Servidor Oracle ARM64 tem CPU limitada; CI é mais rápido e não trava o servidor |
| `PORT=80` via env no compose | Alterar nginx.conf.template | Menor mudança no código existente — aproveita o padrão Railway |
| Portainer no mesmo compose | Portainer separado | Simplicidade — gerencia todos os containers do servidor em uma única interface |
| `platforms: linux/amd64,linux/arm64` | Apenas amd64 | Oracle Cloud free tier usa Ampere A1 (ARM64) — sem multi-plataforma os containers não sobem |

---

## Lições Aprendidas (Gotchas da Implementação)

Erros encontrados durante a implementação que devem ser evitados em projetos futuros:

### 1. ghcr.io exige lowercase
**Problema:** `ghcr.io/DevEderNO/tutorfy-backend:latest` falha com `repository name must be lowercase`.  
**Solução:** Converter `github.repository_owner` com `tr '[:upper:]' '[:lower:]'` no workflow e garantir `GHCR_OWNER=devederno` (minúsculo) no `.env` do servidor.

### 2. Oracle Cloud VM usa ARM64
**Problema:** Oracle Cloud free tier usa processadores Ampere A1 (ARM64). Imagens buildadas sem `platforms: linux/amd64,linux/arm64` retornam `no matching manifest for linux/arm64/v8`.  
**Solução:** Adicionar `platforms: linux/amd64,linux/arm64` em todos os steps de build. O build demora ~15-20 min mas funciona nos dois tipos de servidor.

### 3. Oracle Cloud tem dois firewalls independentes
**Problema:** Abrir porta no UFW (OS) não é suficiente — a Oracle Cloud tem sua própria VCN Security List que bloqueia tráfego no nível de rede.  
**Solução:** Abrir portas 80 e 443 **em ambos**: UFW (`sudo ufw allow 80/tcp`) E VCN Security List (painel Oracle Cloud → Networking → VCN → Security Lists).

### 4. acme.json precisa de chmod 600
**Problema:** O Traefik recusa carregar o `acme.json` se as permissões forem mais abertas que 600.  
**Solução:** Sempre criar com `touch acme.json && chmod 600 acme.json` antes de subir o Traefik.

### 5. Chave SSH com passphrase no GitHub Actions
**Problema:** `ssh.ParsePrivateKey: ssh: this private key is passphrase protected` — o `appleboy/ssh-action` falha silenciosamente se a chave tiver passphrase sem o parâmetro correspondente.  
**Solução:** Adicionar `passphrase: ${{ secrets.SERVER_SSH_PASSPHRASE }}` no step de deploy e criar o secret no GitHub.

### 6. Cloudflare proxy incompatível com Let's Encrypt HTTP challenge
**Problema:** Com o proxy da Cloudflare ativo (nuvem laranja), o Traefik não consegue completar o desafio HTTP do Let's Encrypt para emitir certificados SSL.  
**Solução:** Usar **Somente DNS** (nuvem cinza) nos registros A dos subdomínios gerenciados pelo Traefik. O Traefik gerencia o SSL diretamente.

### 7. nginx.conf.template usa ${PORT} (padrão Railway)
**Problema:** Os Dockerfiles dos frontends usam `nginx.conf.template` com `listen ${PORT}`, variável injetada pelo Railway. Sem a variável definida, o nginx falha.  
**Solução:** Definir `PORT=80` no `environment` de cada serviço frontend no `docker-compose.yml`.

### 8. Portainer — configurar dentro de 5 minutos
**Problema:** Na primeira inicialização, o Portainer exige criação do usuário admin em até 5 minutos. Após esse tempo, bloqueia o acesso por segurança e exige restart do container.  
**Solução:** Acessar `https://portainer.devederno.com.br` imediatamente após o primeiro `docker compose up` e criar o usuário admin.
