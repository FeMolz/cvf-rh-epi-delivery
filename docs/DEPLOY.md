# Deploy e operação em produção

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

```bash
docker build -t rh-system-api .
docker run --env-file .env.production.local -p 3000:3000 rh-system-api
```

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
3. Após merge, na máquina de deploy ou pipeline:
   - `git pull`
   - `npm run db:prod:migrate` (se houver migrations novas)
   - `docker compose -f docker-compose.producao.yml up -d --build` ou reiniciar o processo Node

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
| `npm run db:prod:migrate` | Aplicar migrations no Supabase |
| `npm run seed:admin:prod` | Primeiro admin |
| `npm run backup:prod` | Backup local se banco mudou |
| `npm run dev:prod` | API apontando para Supabase (debug) |
