# Plano de Implementação — Deploy Oracle Cloud

**Design de referência:** `docs/architecture/oracle-cloud-deployment.md`  
**Data:** 2026-05-27

---

## Fase 1 — DNS (fazer primeiro, propaga em até 24h)

- [ ] Acessar painel do registrador de `devederno.com.br`
- [ ] Criar registro A: `tutorfyapp` → `137.131.183.49`
- [ ] Criar registro A: `tutorfyportal` → `137.131.183.49`
- [ ] Criar registro A: `tutorfyapi` → `137.131.183.49`

> Verificar propagação: `nslookup tutorfyapi.devederno.com.br`

---

## Fase 2 — Preparar Servidor (SSH na VM Oracle)

```bash
ssh ubuntu@137.131.183.49
```

- [ ] **Instalar Docker**
  ```bash
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
  # logout e login novamente
  ```

- [ ] **Configurar firewall**
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```

- [ ] **Abrir portas na Oracle Cloud (VCN Security List)**
  - Painel Oracle → Networking → Virtual Cloud Networks → sua VCN → Security Lists → Default
  - Adicionar Ingress Rule: TCP porta 80, origem 0.0.0.0/0
  - Adicionar Ingress Rule: TCP porta 443, origem 0.0.0.0/0

- [ ] **Criar estrutura de diretórios**
  ```bash
  mkdir -p /opt/tutorfy/traefik
  touch /opt/tutorfy/traefik/acme.json
  chmod 600 /opt/tutorfy/traefik/acme.json
  ```

- [ ] **Criar rede Docker externa**
  ```bash
  docker network create proxy
  ```

---

## Fase 3 — Criar Arquivos no Repositório

- [ ] **Criar `traefik/traefik.yml`** (na raiz do repositório)
  - Conteúdo: ver `docs/architecture/oracle-cloud-deployment.md` seção "traefik/traefik.yml"

- [ ] **Atualizar `docker-compose.yml`** (substituir o atual que só tem postgres)
  - Conteúdo: ver `docs/architecture/oracle-cloud-deployment.md` seção "docker-compose.yml"

- [ ] **Criar `.github/workflows/deploy.yml`**
  - Conteúdo: ver `docs/architecture/oracle-cloud-deployment.md` seção "deploy.yml"

- [ ] **Atualizar `.env.example`** com as novas variáveis necessárias no servidor

---

## Fase 4 — Configurar Secrets no GitHub

Acessar: `github.com/DevEderNO/tutorfy → Settings → Secrets and variables → Actions`

- [ ] `SERVER_HOST` = `137.131.183.49`
- [ ] `SERVER_USER` = `ubuntu`
- [ ] `SERVER_SSH_KEY` = conteúdo de `~/.ssh/id_rsa` (chave privada SSH)
- [ ] `VITE_GOOGLE_CLIENT_ID` = Google Client ID do projeto

---

## Fase 5 — Copiar Arquivos para o Servidor

Do computador local (após criar os arquivos na Fase 3):

```bash
# Copiar configuração do Traefik
scp traefik/traefik.yml ubuntu@137.131.183.49:/opt/tutorfy/traefik/traefik.yml

# Copiar docker-compose.yml
scp docker-compose.yml ubuntu@137.131.183.49:/opt/tutorfy/docker-compose.yml

# Criar .env no servidor (NÃO copiar do local — criar diretamente)
ssh ubuntu@137.131.183.49 "nano /opt/tutorfy/.env"
```

Conteúdo do `.env` no servidor:
```env
POSTGRES_USER=tutorfy
POSTGRES_PASSWORD=SENHA_FORTE_AQUI
POSTGRES_DB=tutorfy
DATABASE_URL=postgresql://tutorfy:SENHA_FORTE_AQUI@postgres:5432/tutorfy
JWT_SECRET=SECRET_FORTE_AQUI
GOOGLE_CLIENT_ID=seu_google_client_id
GHCR_OWNER=DevEderNO
```

---

## Fase 6 — Primeiro Deploy Manual (Validação)

```bash
# No servidor
cd /opt/tutorfy

# Login no registry (usar Personal Access Token do GitHub com scope read:packages)
echo SEU_GITHUB_PAT | docker login ghcr.io -u DevEderNO --password-stdin

# Subir tudo
docker compose pull
docker compose up -d

# Acompanhar logs
docker compose logs -f
```

**Checklist de validação:**
- [ ] `docker compose ps` — todos os containers com status `Up`
- [ ] `curl -I https://tutorfyapi.devederno.com.br` — resposta 200 com SSL
- [ ] Acessar `https://tutorfyapp.devederno.com.br` no browser — app carrega
- [ ] Acessar `https://tutorfyportal.devederno.com.br` no browser — portal carrega
- [ ] Certificado SSL válido (cadeado verde no browser)

---

## Fase 7 — Ativar CI/CD Automático

Após validação manual bem-sucedida:

- [ ] Fazer commit de todos os arquivos criados nas fases anteriores
- [ ] Push para `master`
- [ ] Verificar execução do workflow em `github.com/DevEderNO/tutorfy/actions`
- [ ] Confirmar que o deploy automático funcionou sem erros

---

## Troubleshooting Comum

| Problema | Causa provável | Solução |
|---|---|---|
| Container não sobe | `.env` ausente ou variável errada | `docker compose logs <serviço>` |
| SSL não emite | DNS ainda não propagou | Aguardar propagação e reiniciar traefik |
| Porta 80/443 sem resposta | Oracle Security List não aberta | Verificar regras na VCN |
| `acme.json` erro de permissão | Permissão incorreta | `chmod 600 /opt/tutorfy/traefik/acme.json` |
| Backend não conecta no banco | `DATABASE_URL` com host errado | Host deve ser `postgres` (nome do container) |
