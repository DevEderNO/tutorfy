# Acesso ao Admin via SSH Tunnel

O painel admin não tem rota pública — ele fica na rede interna do Docker e é acessado exclusivamente via SSH tunnel.

## Pré-requisitos

- Chave privada SSH com acesso ao servidor Oracle (`137.131.183.49`)
- `ssh-agent` rodando com a chave carregada

## 1. Configurar o SSH

### `~/.ssh/config`

Adicione o bloco abaixo (se ainda não existir):

```
Host tutorfy
    HostName 137.131.183.49
    User ubuntu
    IdentityFile /caminho/para/oracle_server
```

### Carregar a chave no agente

```bash
eval "$(ssh-agent -s)"
ssh-add /caminho/para/oracle_server
```

Para não repetir a cada sessão, adicione ao `~/.zshrc` (ou `~/.bashrc`):

```bash
if [ -z "$SSH_AUTH_SOCK" ]; then
    eval "$(ssh-agent -s)" > /dev/null
    ssh-add /caminho/para/oracle_server 2>/dev/null
fi
```

## 2. Configurar o Servidor (apenas uma vez)

### 2a. Expor o admin na porta local do servidor

No servidor, o `docker-compose.yml` deve ter o port binding no serviço `admin`:

```yaml
admin:
  ports:
    - "127.0.0.1:8081:80"
```

Se ainda não estiver configurado, SSH no servidor e aplique:

```bash
ssh tutorfy
cd /opt/tutorfy
# editar docker-compose.yml e adicionar o ports acima
docker compose up -d --no-deps admin
```

### 2b. Configurar o CORS do backend

No `.env` do servidor, o `ADMIN_URL` deve apontar para a porta do tunnel:

```bash
ssh tutorfy
cd /opt/tutorfy
# editar .env: ADMIN_URL=http://localhost:8081
docker compose up -d --no-deps backend
```

## 3. Acessar o Admin

### Abrir o tunnel

```bash
ssh -L 8081:127.0.0.1:8081 tutorfy -N
```

Deixe o terminal aberto enquanto usar o admin.

### Abrir no browser

```
http://localhost:8081
```

## Observações

- O tunnel precisa estar ativo durante todo o uso do admin.
- Para rodar o tunnel em background: `ssh -fN -L 8081:127.0.0.1:8081 tutorfy`
- Para encerrar o tunnel em background: `pkill -f "ssh -fN"`
- A porta `8081` não está exposta na internet — só é acessível via tunnel.
