# Deploy e operação em produção

> **Guia geral (dev + teste + produção):** [AMBIENTES.md](./AMBIENTES.md)

Guia para colocar a API RH-System na nuvem, trabalhar com o ambiente ativo e manter backups.

---

## 1. Visão geral da arquitetura

```text
                    ┌─────────────────┐
                    │  Redis Cloud    │  rate limit distribuído
                    └────────┬────────┘
                             │
┌──────────────┐    ┌────────▼────────┐    ┌──────────────────┐
│ baseCAEPI    │◄───│  RH-System API  │───►│ Supabase Postgres │
│ (Docker/VPS) │    │  porta 3000     │    │ 6543 runtime      │
└──────────────┘    └─────────────────┘    │ 5432 migrations   │
                                           └──────────────────┘
```

| Componente | Onde roda | Variável |
|------------|-----------|----------|
| API | VPS / PaaS / `docker-compose.producao.yml` | — |
| Banco | Supabase | `DATABASE_URL`, `DIRECT_URL` |
| Redis | Redis Cloud (já configurado) | `REDIS_URL` |
| CAEPI | Container na mesma VPS (`docker-compose.producao.yml`) | `CAEPI_API_URL` |
| Secullum | Externo (por cliente) | `SECULLUM_*` |

---

## 2. Pré-requisitos

1. Projeto Supabase com `DATABASE_URL` (6543) e `DIRECT_URL` (5432).
2. Redis Cloud com URL `rediss://...` ou `redis://...`.
3. `.env.production.local` preenchido a partir de `.env.production.example`.
4. Docker instalado (se usar compose de produção com CAEPI).

### CORS sem frontend

A API **exige** `CORS_ORIGINS` em produção, mas isso só bloqueia navegadores. Postman, curl e integrações server-to-server funcionam normalmente.

Use um placeholder até o frontend existir:

```env
CORS_ORIGINS="https://app.suaempresa.com"
```

Atualize quando o domínio real estiver definido — sem alteração de código.

---

## 3. Primeiro deploy (checklist)

```bash
# 1. Variáveis de produção
copy .env.production.example .env.production.local
# Edite: JWT_SECRET (32+), Supabase, REDIS_URL, CORS_ORIGINS, ADMIN_SEED_*

# 2. Schema no Supabase (preferir migrations em produção)
npm run db:prod:migrate
# Alternativa em banco vazio: npm run db:prod:push

# 3. Admin inicial (apenas uma vez)
npm run seed:admin:prod

# 4a. Subir com Docker (API + CAEPI na nuvem)
npm run docker:prod:up

# 4b. Ou subir só Node (CAEPI em outro host)
npm run dev:prod
```

Validar:

```bash
curl http://localhost:3000/health
# Esperado: status OK, database OK, caepi OK
```

Login: `POST /api/v1/users/login` com credenciais do seed.

---

## 4. Dockerfile e Docker Compose

### Build manual

O `Dockerfile` usa o **monorepo inteiro** como contexto (o `package-lock.json` fica na raiz, não em `backend/`).

```bash
# Na raiz do repositório
docker build -f backend/Dockerfile -t rh-system-api .
docker run --env-file backend/.env.production.local -p 3000:3000 rh-system-api
```

### Web Service (Render, Railway, etc.)

| Campo | Valor |
|-------|-------|
| **Root Directory** | *(vazio — raiz do repositório)* |
| **Dockerfile Path** | `backend/Dockerfile` |

Não use `backend/` como Root Directory: o build falha com `package-lock.json: not found`.

**Porta:** o Render injeta `PORT` automaticamente em runtime. A API já usa `process.env.PORT` (fallback `3000` só em local). **Não** defina `PORT` nas variáveis de ambiente do Render — se copiar `.env.production.local` com `PORT=3000`, remova essa linha ou o serviço pode não subir.

A imagem inclui **Chromium** para geração de PDF (Puppeteer). Variável `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium` já está no `Dockerfile`.

### Compose de produção (`docker-compose.producao.yml`)

Sobe **dois** serviços:

| Serviço | Imagem | Porta host |
|---------|--------|------------|
| `caepi-api` | `joaoaugustomv/api_base_ca_epi:2.0` | 8080 |
| `api` | build do `Dockerfile` | 3000 |

O compose define `CAEPI_API_URL=http://caepi-api` na rede interna. **Redis não sobe localmente** — use Redis Cloud via `REDIS_URL` no `.env.production.local`.

```bash
npm run docker:prod:up      # build + up -d
npm run docker:prod:down    # parar
docker compose -f docker-compose.producao.yml logs -f api
```

---

## 5. Fluxo de trabalho com a API em produção

### Desenvolvimento local (dia a dia)

| Ação | Comando | Banco |
|------|---------|-------|
| Codar | `npm run dev` | `.env` local |
| Testar manualmente | `npm run dev:test` | `.env.test` + seeds falsos |
| Testes automatizados | `npm test` | mocks (sem banco) |

**Nunca** aponte `.env` de desenvolvimento para o Supabase de produção.

### Alteração de código que vai para produção

1. Desenvolver na branch `feature/...`.
2. Abrir PR para `main` — o CI roda lint, testes unitários, smoke de rotas e integração.
3. Após merge na `main`, o **CD** (`.github/workflows/deploy.yml`) faz deploy na VPS se o CI passou — ou rode `npm run deploy:prod` no servidor.

### Alteração só de dados

Use a API autenticada (ADMIN). **Não** rode seeds de desenvolvimento em produção, exceto `seed:admin:prod` no primeiro deploy.

### Schema / migrations

| Situação | Comando |
|----------|---------|
| Nova migration no repositório | `npm run db:prod:migrate` |
| Banco vazio / prototipagem | `npm run db:prod:push` (evitar em produção estável) |

### Monitoramento

- `GET /health` — database + CAEPI
- Opcional: `HEALTH_CHECK_TOKEN` para esconder detalhes (ver `docs/SEGURANCA.md`)
- Logs de auditoria em `EventoAuditoriaSeguranca` (console + banco)

### Rollback de código

1. Reverter commit ou deploy da imagem anterior.
2. **Cuidado com migrations**: Prisma não faz rollback automático — planeje migrations reversíveis.

---

## 6. Backup do banco (a cada 1h, só se mudou)

### Como funciona

1. A cada hora, o workflow `.github/workflows/backup.yml` (ou `npm run backup:prod` local) executa `scripts/backup-postgres-se-mudou.mjs`.
2. O script calcula um **fingerprint** do banco: para cada tabela `public`, soma `count(*)` + `max(updatedAt)` quando existir.
3. Compara com o fingerprint salvo em `.backups/manifest.json` (local) ou do run anterior (CI).
4. **Se igual** → nada é gravado (economia de espaço).
5. **Se diferente** → `pg_dump` comprimido (`.sql.gz`) + manifesto atualizado.

Isso detecta inserts, updates e deletes. Não grava backup redundante quando o banco está estável.

### Local

Requer `pg_dump` no PATH (cliente PostgreSQL):

```bash
npm run backup:prod
# Arquivos em .backups/ (gitignored)
```

### GitHub Actions (nuvem)

1. No repositório: **Settings → Secrets and variables → Actions**.
2. Crie o secret `DATABASE_BACKUP_DIRECT_URL` com a `DIRECT_URL` do Supabase (porta **5432**).
3. O workflow roda no cron `5 * * * *` (a cada hora, UTC).
4. Quando há mudança, o artefato `.sql.gz` fica disponível por 90 dias em **Actions → Backup PostgreSQL**.

Para backup off-site adicional, baixe periodicamente os artefatos ou estenda o workflow para S3/R2.

### Restaurar um backup

```bash
gunzip -c .backups/rh-system-YYYY-MM-DD.sql.gz | psql "$DIRECT_URL"
```

Teste primeiro em banco de homologação.

---

## 7. CI e branch protection

O pipeline `.github/workflows/ci.yml` executa em **todo push e PR**:

| Etapa | Comando |
|-------|---------|
| Lint | `npm run lint` |
| Unitários | `npm test` |
| Smoke rotas | `npm run test:routes` |
| Integração | Postgres 16 + `npm run test:integracao` |

Para **impedir merge** com código quebrado, configure branch protection no GitHub — passo a passo em [BRANCH_PROTECTION.md](./BRANCH_PROTECTION.md).

---

## 7.1 CD — deploy automático após CI (GitHub Actions)

O workflow `.github/workflows/deploy.yml` faz deploy na VPS **automaticamente** quando:

1. O workflow **CI** termina com **success** em um push na `main`, ou
2. Você dispara manualmente em **Actions → Deploy producao → Run workflow**.

### Fluxo

```text
push/merge na main → CI (testes) verde → Deploy producao → SSH no servidor → cd monorepo && npm run deploy:prod
```

O script `scripts/deploy-producao.mjs` no servidor executa:

1. `git fetch` + `reset` para `origin/main`
2. `npm ci --omit=dev` + `prisma generate`
3. `npm run db:prod:migrate` (usa `.env.production.local` do servidor)
4. `docker compose -f docker-compose.producao.yml up -d --build`
5. Valida `GET http://127.0.0.1:3000/health`

### Pré-requisitos no servidor (uma vez)

| Requisito | Versão sugerida |
|-----------|-----------------|
| Linux (VPS) | Ubuntu 22.04+ |
| Git | clone do repositório |
| Node.js | 20+ |
| Docker + Compose | plugin v2 |
| `.env.production.local` | em `backend/` (nunca no Git) |

```bash
# Exemplo de preparação inicial no servidor (monorepo)
git clone https://github.com/FeMolz/CVF-System.git
cd CVF-System
npm install
cp backend/.env.production.example backend/.env.production.local   # edite com credenciais reais
npm run db:prod:migrate
npm run seed:admin:prod    # só primeira vez
```

`DEPLOY_PATH` no GitHub deve apontar para a **raiz do monorepo** (ex.: `/home/ubuntu/CVF-System`), não para `backend/`.

### Secrets no GitHub (Settings → Secrets and variables → Actions)

| Secret | Exemplo | Obrigatório |
|--------|---------|--------------|
| `DEPLOY_HOST` | `203.0.113.10` ou `api.suaempresa.com` | Sim |
| `DEPLOY_USER` | `ubuntu` | Sim |
| `DEPLOY_SSH_PRIVATE_KEY` | conteúdo da chave privada SSH (PEM) | Sim |
| `DEPLOY_PATH` | `/home/ubuntu/CVF-System` | Sim |
| `DEPLOY_PORT` | `22` | Não (padrão 22) |

### Chave SSH para o deploy

No **seu PC** (ou gere no servidor):

```bash
ssh-keygen -t ed25519 -C "github-deploy-rh-system" -f deploy_rh_system -N ""
```

- Cole o conteúdo de `deploy_rh_system.pub` em `~/.ssh/authorized_keys` **no servidor**
- Cole o conteúdo de `deploy_rh_system` (privada) no secret `DEPLOY_SSH_PRIVATE_KEY`

### Environment `production` (opcional, recomendado)

Em **Settings → Environments → New environment** → nome `production`:

- Pode exigir aprovação manual antes de cada deploy
- Pode restringir à branch `main`

O workflow já referencia `environment: production`.

### Deploy manual (sem esperar CI)

GitHub → **Actions** → **Deploy producao** → **Run workflow**.

Ou no servidor:

```bash
cd /caminho/do/projeto
npm run deploy:prod
```

### Rollback rápido

```bash
cd $DEPLOY_PATH
git reset --hard <commit-anterior>
npm run deploy:prod
```

Migrations já aplicadas **não** revertem automaticamente — planeje migrations compatíveis.

---

## 8. Variáveis obrigatórias em produção

| Variável | Notas |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Supabase pooler 6543 + `?pgbouncer=true` |
| `DIRECT_URL` | Supabase sessão 5432 |
| `JWT_SECRET` | Mínimo 32 caracteres |
| `CORS_ORIGINS` | Lista explícita (placeholder OK sem frontend) |
| `REDIS_URL` | Redis Cloud |
| `CAEPI_API_URL` | `http://caepi-api` no compose, ou URL pública |

Detalhes: [SEGURANCA.md](./SEGURANCA.md), [SUPABASE.md](./SUPABASE.md).

---

## 9. Referências rápidas

| Comando | Uso |
|---------|-----|
| `npm run docker:prod:up` | API + CAEPI em produção |
| `npm run deploy:prod` | Deploy completo no servidor (git + migrate + docker + health) |
| `npm run db:prod:migrate` | Aplicar migrations no Supabase |
| `npm run seed:admin:prod` | Primeiro admin |
| `npm run backup:prod` | Backup local se banco mudou |
| `npm run dev:prod` | API apontando para Supabase (debug) |
