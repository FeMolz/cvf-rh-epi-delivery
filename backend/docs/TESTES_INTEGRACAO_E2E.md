# Testes de integração e E2E

Mapa das suites automatizadas que exercitam **banco real** (integração) e **UI + API** (Playwright).

---

## 1. Visão geral

| Camada | O que valida | O que mocka |
|--------|--------------|-------------|
| **Integração** (`*.integracao.test.js`) | PostgreSQL + Prisma + services | CAEPI externa (cache local), Puppeteer, Supabase (em relatórios) |
| **E2E** (`e2e/*.spec.js`) | Fluxos completos na UI + proxy `/api/v1` | Nada no browser; dados únicos por teste |

---

## 2. Pré-requisitos

### Integração

- PostgreSQL de teste acessível (`RUN_INTEGRATION_TESTS=true`).
- Local (Docker): `docker compose -f backend/docker-compose.test.yml up -d` (porta **5433**).
- CI: serviço Postgres na porta **5432** (`rh_system_ci`).

### E2E

- Docker Desktop (local) para Postgres/Redis de teste, **ou** banco já rodando.
- Seeds completos (`npm run seed:all:test -w backend`) — executados automaticamente pelo `global-setup` do Playwright.
- **Puppeteer/Chrome** no backend para emissão real de PDF (`npm run puppeteer:install -w backend`).
- **Supabase Storage** configurado em `backend/.env.test` para upload/download de PDF nos testes de relatório.

---

## 3. Suites de integração

Arquivos em `backend/src/shared/testes/integracao/`:

| Arquivo | Cenários |
|---------|----------|
| `usuarios.integracao.test.js` | CreateUser, login, duplicidade, hierarquia ADMIN; filtros de funcionários |
| `empresasSetores.integracao.test.js` | CRUD empresa/setor; bloqueio de exclusão com funcionários |
| `cargosFuncionarios.integracao.test.js` | CRUD cargo/funcionário; bloqueio de exclusão de cargo |
| `episVinculos.integracao.test.js` | Link/Unlink/List EPI por cargo |
| `entregasEpi.integracao.test.js` | CreateEpiDelivery; pausa/retomada de periodicidade |
| `relatoriosEpi.integracao.test.js` | Geração PDF (mock), listagem, download (mock Supabase) |

Fábricas reutilizáveis: `backend/src/shared/testes/integracao/utilitarios/`.

---

## 4. Suites E2E (Playwright)

| Spec | Papel | Fluxo |
|------|-------|-------|
| `login.spec.js` | — | Login e redirecionamento |
| `fluxo-autenticacao-usuario.spec.js` | ADMIN | Criar usuário, detalhe, logout, login novo usuário |
| `fluxo-gerenciamento-crud.spec.js` | ADMINISTRATIVO | Empresa, setor, cargo, funcionário |
| `fluxo-epi.spec.js` | ADMINISTRATIVO + ALMOXARIFADO | Vínculo EPI; entrega |
| `fluxo-relatorios.spec.js` | ADMINISTRATIVO | Emitir, listar, download PDF real (`%PDF`) |
| `permissoes-papeis.spec.js` | Vários | RBAC por módulo |
| `modulos-em-breve.spec.js` | — | Placeholders de módulos futuros |

Helpers: `e2e/helpers/` (`dadosSeed`, `navegacao`, `gerenciamento`, `epi`, `api`, `login`).

Credenciais seed: `admin@rhsystem.com`, `administrativo@rhsystem.com`, `almoxarifado@rhsystem.com` — senha `AlterarSenha123!`.

---

## 5. Comandos

```bash
# Integração (na raiz do monorepo)
npm run test:integracao

# E2E (sobe backend + frontend de teste automaticamente)
npm run test:e2e

# E2E com interface
npm run test:e2e:ui

# Pipeline completo local
npm run test:deploy
```

---

## 6. CI (GitHub Actions)

- `testes-unitarios` — coverage 100% backend + smoke de rotas + frontend.
- `testes-integracao` — Postgres service + `npm run test:integracao`.
- `testes-e2e` — Postgres + seeds + Puppeteer + Playwright Chromium.

Variáveis necessárias no job E2E: `JWT_SECRET`, `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (secrets do repositório).

---

## 7. Dados de seed úteis nos E2E

Constantes em `backend/prisma/seeders/dados/identificadoresSeedConstantes.js`:

- Funcionários: **Ana Silva**, **Bruno Costa**, **Carla Mendes**
- EPIs (CA): **11070** (capacete), **4280** (luva)
- Cargos: Analista de Sistemas, Pedreiro, Auxiliar Administrativo

---

## 8. Referências

- [Banco de teste](./BANCO_TESTE.md)
- [Cobertura de endpoints](./COBERTURA_ENDPOINTS.md)
