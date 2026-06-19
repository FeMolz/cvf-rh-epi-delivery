# RH-System

Monorepo **fullstack** do RH-System: API Node.js/Express (`backend`) e aplicação web (`frontend`).

```text
RH-System/
├── backend/          # API REST (Express, Prisma, PostgreSQL)
├── frontend/         # App web (em construção)
├── .github/          # CI/CD (GitHub Actions)
├── package.json      # Workspaces npm — scripts na raiz delegam ao backend
└── AGENTS.md         # Diretrizes para agentes de IA
```

---

## Início rápido

### Pré-requisitos

- **Node.js** 20+
- **PostgreSQL** (local, Docker ou Supabase)
- **Docker** (opcional — CAEPI, testes, produção)

### Instalação

```bash
git clone https://github.com/FeMolz/CVF-System.git
cd CVF-System
npm install
```

Configure o backend: copie `backend/.env.production.example` ou use `.env` / `.env.development.local` em `backend/` (veja [backend/README.md](./backend/README.md)).

### Comandos na raiz

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | API em desenvolvimento (`backend`) |
| `npm run dev:frontend` | App React em http://localhost:5173 |
| `npm test` | Testes unitários do backend |
| `npm run test:frontend` | Testes Vitest do frontend |
| `npm run lint` | ESLint backend + frontend |
| `npm run docker:prod:up` | Stack Docker de produção (API + CAEPI) |

Todos os scripts do backend também podem ser executados com `npm run <script> -w backend` ou dentro de `backend/`.

---

## Documentação

| Área | Onde |
|------|------|
| API, módulos, endpoints | [backend/README.md](./backend/README.md) e [backend/docs/](./backend/docs/) |
| Deploy e CD | [backend/docs/DEPLOY.md](./backend/docs/DEPLOY.md) |
| Frontend | [frontend/README.md](./frontend/README.md) |
| Agentes de IA | [AGENTS.md](./AGENTS.md) |

---

## Repositório

- **GitHub:** [FeMolz/CVF-System](https://github.com/FeMolz/CVF-System)
- **CI:** push/PR → testes no `backend`
- **CD:** merge na `main` com CI verde → deploy na VPS (ver DEPLOY.md)
