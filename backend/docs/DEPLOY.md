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
│ (serviço ext)│    │  Render (PaaS)  │    │ 6543 runtime      │
└──────────────┘    └─────────────────┘    │ 5432 migrations   │
                                           └──────────────────┘
```

| Componente | Onde roda                                              | Variável                     |
| ---------- | ------------------------------------------------------ | ---------------------------- |
| API        | **Render** (Web Service Docker)                        | —                            |
| Banco      | Supabase                                               | `DATABASE_URL`, `DIRECT_URL` |
| Redis      | Redis Cloud (já configurado)                           | `REDIS_URL`                  |
| CAEPI      | Serviço externo (URL pública ou container separado)    | `CAEPI_API_URL`              |
| Secullum   | Externo (por cliente)                                  | `SECULLUM_*`                 |

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

### Produção no Render (recomendado)

1. No [Render](https://render.com), crie um **Web Service** conectado ao repositório GitHub (`FeMolz/CVF-System`).
2. Configure o build conforme a seção [Web Service (Render)](#web-service-render-railway-etc) abaixo.
3. Defina as variáveis de ambiente no painel do Render (mesmas de `.env.production.example`: `JWT_SECRET`, Supabase, `REDIS_URL`, `CORS_ORIGINS`, etc.). **Não** defina `PORT` — o Render injeta automaticamente.
4. Na sua máquina, com `backend/.env.production.local` preenchido, aplique o schema e o admin inicial:

```bash
npm run db:prod:migrate
npm run seed:admin:prod    # apenas uma vez
```

5. Faça merge na `main` — o Render faz build e sobe a API automaticamente.

Validar:

```bash
curl https://<seu-servico>.onrender.com/health
```

### Stack Docker local (opcional — desenvolvimento ou homologação)

Para subir API + CAEPI na mesma máquina com Docker Compose:

```bash
copy backend/.env.production.example backend/.env.production.local
# Edite: JWT_SECRET (32+), Supabase, REDIS_URL, CORS_ORIGINS, ADMIN_SEED_*

npm run docker:prod:up -w backend
# Ou só Node: npm run dev:prod -w backend
```

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

| Campo               | Valor                           |
| ------------------- | ------------------------------- |
| **Root Directory**  | _(vazio — raiz do repositório)_ |
| **Dockerfile Path** | `backend/Dockerfile`            |

Não use `backend/` como Root Directory: o build falha com `package-lock.json: not found`.

**Porta:** o Render injeta `PORT` automaticamente em runtime. A API já usa `process.env.PORT` (fallback `3000` só em local). **Não** defina `PORT` nas variáveis de ambiente do Render — se copiar `.env.production.local` com `PORT=3000`, remova essa linha ou o serviço pode não subir.

A imagem inclui **Chromium** para geração de PDF (Puppeteer). Variável `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium` já está no `Dockerfile`.

### Compose de produção (`docker-compose.producao.yml`)

Sobe **dois** serviços:

| Serviço     | Imagem                              | Porta host |
| ----------- | ----------------------------------- | ---------- |
| `caepi-api` | `joaoaugustomv/api_base_ca_epi:2.0` | 8080       |
| `api`       | build do `Dockerfile`               | 3000       |

O compose define `CAEPI_API_URL=http://caepi-api` na rede interna. **Redis não sobe localmente** — use Redis Cloud via `REDIS_URL` no `.env.production.local`.

```bash
npm run docker:prod:up      # build + up -d
npm run docker:prod:down    # parar
docker compose -f docker-compose.producao.yml logs -f api
```

---

## 5. Fluxo de trabalho com a API em produção

### Desenvolvimento local (dia a dia)

| Ação                 | Comando            | Banco                      |
| -------------------- | ------------------ | -------------------------- |
| Codar                | `npm run dev`      | `.env` local               |
| Testar manualmente   | `npm run dev:test` | `.env.test` + seeds falsos |
| Testes automatizados | `npm test`         | mocks (sem banco)          |

**Nunca** aponte `.env` de desenvolvimento para o Supabase de produção.

### Alteração de código que vai para produção

1. Desenvolver na branch `feature/...`.
2. Abrir PR para `main` — o CI roda lint, testes unitários, smoke de rotas e integração.
3. Após merge na `main`, o **Render** faz deploy automático da API (build Docker + restart do serviço).

### Alteração só de dados

Use a API autenticada (ADMIN). **Não** rode seeds de desenvolvimento em produção, exceto `seed:admin:prod` no primeiro deploy.

### Schema / migrations

| Situação                      | Comando                                             |
| ----------------------------- | --------------------------------------------------- |
| Nova migration no repositório | `npm run db:prod:migrate`                           |
| Banco vazio / prototipagem    | `npm run db:prod:push` (evitar em produção estável) |

### Monitoramento

- `GET /health` — database + CAEPI
- Opcional: `HEALTH_CHECK_TOKEN` para esconder detalhes (ver `docs/SEGURANCA.md`)
- Logs de auditoria em `EventoAuditoriaSeguranca` (console + banco)

### Rollback de código

1. Reverter commit ou deploy da imagem anterior.
2. **Cuidado com migrations**: Prisma não faz rollback automático — planeje migrations reversíveis.

---

## 6. Backup do banco (manual, só se mudou)

### Como funciona

1. Execute `npm run backup:prod` (local ou no servidor) para rodar `scripts/backup-postgres-se-mudou.mjs`.
2. O script calcula um **fingerprint** do banco: para cada tabela `public`, soma `count(*)` + `max(updatedAt)` quando existir.
3. Compara com o fingerprint salvo em `.backups/manifest.json`.
4. **Se igual** → nada é gravado (economia de espaço).
5. **Se diferente** → `pg_dump` comprimido (`.sql.gz`) + manifesto atualizado.

Isso detecta inserts, updates e deletes. Não grava backup redundante quando o banco está estável.

Não há cron no GitHub Actions para este backup (removido para não consumir minutos da cota).

### Local / produção

Requer `pg_dump` no PATH (cliente PostgreSQL) e `DIRECT_URL` (porta 5432):

```bash
npm run backup:prod
# Arquivos em .backups/ (gitignored)
```

### Restaurar um backup

```bash
gunzip -c .backups/rh-system-YYYY-MM-DD.sql.gz | psql "$DIRECT_URL"
```

Teste primeiro em banco de homologação.

---

## 7. CI e branch protection

O pipeline `.github/workflows/ci.yml` executa em **todo push e PR**:

| Etapa       | Comando                                 |
| ----------- | --------------------------------------- |
| Lint        | `npm run lint`                          |
| Unitários   | `npm test`                              |
| Smoke rotas | `npm run test:routes`                   |
| Integração  | Postgres 16 + `npm run test:integracao` |

Para **impedir merge** com código quebrado, configure branch protection no GitHub — passo a passo em [BRANCH_PROTECTION.md](./BRANCH_PROTECTION.md).

---

## 7.1 CD — deploy automático no Render

A produção usa **apenas o Render** como plataforma de deploy. Não há workflow de deploy via SSH/VPS no GitHub Actions.

### Fluxo

```text
push/merge na main → CI (testes) no GitHub Actions
                  → Render (webhook) → build backend/Dockerfile → sobe Web Service
```

O GitHub Actions executa **somente testes** (`.github/workflows/ci.yml`). O deploy em si é responsabilidade do Render, conectado ao repositório.

### Configuração no Render (uma vez)

| Campo               | Valor                           |
| ------------------- | ------------------------------- |
| **Tipo**            | Web Service                     |
| **Repositório**     | `FeMolz/CVF-System`             |
| **Branch**          | `main`                          |
| **Root Directory**  | _(vazio — raiz do repositório)_ |
| **Runtime**         | Docker                          |
| **Dockerfile Path** | `backend/Dockerfile`            |
| **Auto-Deploy**     | Sim (on push to `main`)         |

### Migrations antes do deploy

O `Dockerfile` **não** executa `prisma migrate deploy` no startup. Quando houver nova migration no repositório, aplique no Supabase **antes** (ou logo após) o merge:

```bash
npm run db:prod:migrate
```

Use `backend/.env.production.local` na sua máquina (com `DIRECT_URL` na porta 5432).

### Rollback no Render

1. No painel do Render: **Manual Deploy** → selecione um commit anterior da `main`, ou
2. Reverta o commit no GitHub e faça merge — o Render redeploya automaticamente.

**Cuidado com migrations:** Prisma não faz rollback automático — planeje migrations reversíveis.

### Environment `production` no GitHub (opcional)

Se você criou o environment `production` no GitHub para o workflow de VPS antigo, pode removê-lo em **Settings → Environments** — ele não é mais usado.

---

## 8. Variáveis obrigatórias em produção

| Variável        | Notas                                         |
| --------------- | --------------------------------------------- |
| `NODE_ENV`      | `production`                                  |
| `DATABASE_URL`  | Supabase pooler 6543 + `?pgbouncer=true`      |
| `DIRECT_URL`    | Supabase sessão 5432                          |
| `JWT_SECRET`    | Mínimo 32 caracteres                          |
| `CORS_ORIGINS`  | Lista explícita (placeholder OK sem frontend) |
| `REDIS_URL`     | Redis Cloud                                   |
| `CAEPI_API_URL` | `http://caepi-api` no compose, ou URL pública |

Detalhes: [SEGURANCA.md](./SEGURANCA.md), [SUPABASE.md](./SUPABASE.md).

---

## 9. Referências rápidas

| Comando                   | Uso                                                           |
| ------------------------- | ------------------------------------------------------------- |
| `npm run docker:prod:up`  | API + CAEPI local (Docker Compose — não é o deploy no Render) |
| `npm run db:prod:migrate` | Aplicar migrations no Supabase                                |
| `npm run seed:admin:prod` | Primeiro admin                                                |
| `npm run backup:prod`     | Backup local se banco mudou                                   |
| `npm run dev:prod`        | API apontando para Supabase (debug)                           |
