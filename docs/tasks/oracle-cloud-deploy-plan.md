# Plano de Implementação — Deploy Oracle Cloud

**Design de referência:** `docs/architecture/oracle-cloud-deployment.md`  
**Data:** 2026-05-27  
**Status:** ✅ Concluído

---

## Fase 1 — DNS ✅

- [x] Acessar painel Cloudflare de `devederno.com.br`
- [x] Criar registro A: `tutorfyapp` → `137.131.183.49` (Somente DNS)
- [x] Criar registro A: `tutorfyportal` → `137.131.183.49` (Somente DNS)
- [x] Criar registro A: `tutorfyapi` → `137.131.183.49` (Somente DNS)
- [x] Criar registro A: `portainer` → `137.131.183.49` (Somente DNS)

> ⚠️ Manter proxy **desativado** (nuvem cinza) — proxy ativo quebra o Let's Encrypt do Traefik.  
> Domínio registrado na Hostinger com nameservers apontando para Cloudflare.

---

## Fase 2 — Preparar Servidor ✅

```bash
ssh -i /home/ederzera/Documentos/servers/oracle/keys/oracle_server ubuntu@137.131.183.49
```

- [x] **Instalar Docker**
  ```bash
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
  # logout e login novamente para o grupo ter efeito
  ```

- [x] **Configurar firewall (UFW)**
  ```bash
  sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw enable
  # Confirmar com "y" quando perguntado
  ```

- [x] **Abrir portas na Oracle Cloud (VCN Security List)**
  - Painel Oracle → Networking → Virtual Cloud Networks → VCN → Security Lists → Default
  - Ingress Rule: TCP porta 80, origem 0.0.0.0/0
  - Ingress Rule: TCP porta 443, origem 0.0.0.0/0
  > ⚠️ Oracle Cloud tem dois firewalls independentes — UFW sozinho não é suficiente.

- [x] **Criar estrutura de diretórios**
  ```bash
  mkdir -p /opt/tutorfy/traefik
  touch /opt/tutorfy/traefik/acme.json
  chmod 600 /opt/tutorfy/traefik/acme.json   # obrigatório — Traefik rejeita permissões mais abertas
  ```

- [x] **Criar rede Docker externa**
  ```bash
  docker network create proxy
  ```

---

## Fase 3 — Criar Arquivos no Repositório ✅

- [x] Criar `traefik/traefik.yml`
- [x] Atualizar `docker-compose.yml` (6 serviços: traefik, postgres, backend, web, portal, admin, portainer)
- [x] Criar `.github/workflows/deploy.yml` com build multi-plataforma (amd64 + arm64)
- [x] Atualizar `.env.example`

---

## Fase 4 — Configurar Secrets no GitHub ✅

`github.com/DevEderNO/tutorfy → Settings → Secrets and variables → Actions`

- [x] `SERVER_HOST` = `137.131.183.49`
- [x] `SERVER_USER` = `ubuntu`
- [x] `SERVER_SSH_KEY` = conteúdo da chave privada (sem `.pub`)
  ```bash
  cat /home/ederzera/Documentos/servers/oracle/keys/oracle_server
  ```
- [x] `SERVER_SSH_PASSPHRASE` = passphrase da chave SSH
- [x] `VITE_GOOGLE_CLIENT_ID` = Google Client ID do projeto

---

## Fase 5 — Copiar Arquivos para o Servidor ✅

```bash
# Especificar chave SSH com -i (chave não está em ~/.ssh/)
scp -i /home/ederzera/Documentos/servers/oracle/keys/oracle_server \
  docker-compose.yml ubuntu@137.131.183.49:/opt/tutorfy/docker-compose.yml

scp -i /home/ederzera/Documentos/servers/oracle/keys/oracle_server \
  traefik/traefik.yml ubuntu@137.131.183.49:/opt/tutorfy/traefik/traefik.yml
```

Criar `.env` **diretamente no servidor** (nunca copiar do local):
```bash
nano /opt/tutorfy/.env
```

```env
POSTGRES_USER=tutorfy
POSTGRES_PASSWORD=SENHA_FORTE_AQUI
POSTGRES_DB=tutorfy
DATABASE_URL=postgresql://tutorfy:SENHA_FORTE_AQUI@postgres:5432/tutorfy
JWT_SECRET=SECRET_FORTE_AQUI
GOOGLE_CLIENT_ID=seu_google_client_id
GHCR_OWNER=devederno
```

> ⚠️ `GHCR_OWNER` deve ser **lowercase** (`devederno`) — ghcr.io rejeita letras maiúsculas nas tags.

---

## Fase 6 — Primeiro Deploy Manual ✅

```bash
cd /opt/tutorfy
docker compose pull
docker compose up -d
docker compose ps  # verificar status
```

**Validação:**
- [x] `docker compose ps` — todos os 7 containers com status `Up`
- [x] `curl -I https://tutorfyapi.devederno.com.br` — resposta `HTTP/2 404` (esperado, sem rota raiz)
- [x] `https://tutorfyapp.devederno.com.br` — app carrega
- [x] `https://tutorfyportal.devederno.com.br` — portal carrega
- [x] `https://portainer.devederno.com.br` — Portainer configurado

---

## Fase 7 — CI/CD Automático ✅

- [x] Push para `master` dispara build + deploy automaticamente
- [x] Workflow verificado em `github.com/DevEderNO/tutorfy/actions`

---

## Troubleshooting

| Problema | Causa | Solução |
|---|---|---|
| `repository name must be lowercase` | `GHCR_OWNER` com maiúsculas | Corrigir `.env` para `GHCR_OWNER=devederno` |
| `no matching manifest for linux/arm64/v8` | Build sem multi-plataforma | Adicionar `platforms: linux/amd64,linux/arm64` no workflow |
| Container não sobe | `.env` ausente ou variável errada | `docker compose logs <serviço>` |
| SSL não emite | DNS não propagou ou proxy Cloudflare ativo | Desativar proxy (nuvem cinza); aguardar propagação |
| Porta 80/443 sem resposta | Oracle Security List não aberta | Verificar Ingress Rules na VCN |
| `acme.json` erro de permissão | `chmod` incorreto | `chmod 600 /opt/tutorfy/traefik/acme.json` |
| Backend não conecta no banco | `DATABASE_URL` com host errado | Host deve ser `postgres` (nome do container) |
| SSH falha com passphrase | Falta parâmetro no ssh-action | Adicionar `passphrase: ${{ secrets.SERVER_SSH_PASSPHRASE }}` |
| Portainer bloqueado | Não configurado em 5 min | `docker compose restart portainer` e acessar imediatamente |
