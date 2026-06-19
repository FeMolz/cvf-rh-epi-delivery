# Frontend RH-System

Aplicação web em **React + Vite** com **Vitest** e **ESLint**.

## Módulo inicial: usuários e autenticação

- Login (`POST /api/v1/users/login`)
- Cadastro de usuários com RBAC (`POST /api/v1/users`) — apenas `ADMIN` e `ADMINISTRATIVO`
- Hierarquia de papéis espelhada do backend

## Estrutura

```text
frontend/src/
├── modules/usuarios/     # páginas, formulários e API de usuários
├── shared/
│   ├── api/              # cliente HTTP
│   ├── auth/             # contexto JWT e rotas protegidas
│   ├── constants/        # papéis RBAC
│   └── utils/            # hierarquia de permissões
└── App.jsx               # rotas principais
```

## Comandos

Na **raiz do monorepo**:

```bash
npm install
npm run dev:frontend      # http://localhost:5173 (proxy → API porta 3000)
npm run dev:test          # API teste (3001) + frontend (proxy → 3001)
npm run dev:test:frontend # só frontend no modo teste (com backend já rodando)
npm run test:frontend
npm run lint:frontend
```

Ou dentro de `frontend/`:

```bash
npm run dev
npm test
npm run lint
```

## Testar localmente (ver a página)

### 1. Backend rodando

Em um terminal, na raiz:

```bash
npm run dev:backend
```

A API deve responder em `http://localhost:3000`.

Se ainda não tiver usuário admin:

```bash
cd backend
# configure .env com DATABASE_URL e JWT_SECRET
npm run seed:admin
```

### 2. Frontend

Em outro terminal, na raiz:

```bash
npm run dev:frontend
```

Abra **http://localhost:5173**

- **Login:** `/login` — use o e-mail/senha do admin seed
- **Cadastro:** `/usuarios/cadastro` — após login como ADMIN ou ADMINISTRATIVO

O Vite faz **proxy** de `/api` → `localhost` na porta definida por `RH_API_PORT` (3000 em `npm run dev`, 3001 em `npm run dev:test`).

### Ambiente de teste (banco `rh_system_test`)

Na raiz do monorepo:

```bash
npm run dev:test
```

Ou, em dois terminais: `npm run dev:test:backend` e `npm run dev:test:frontend`.

### 3. Variáveis (opcional)

```bash
cp .env.example .env
```

Padrão: `VITE_API_URL=/api/v1`

## Rotas da aplicação

| Rota | Acesso |
|------|--------|
| `/login` | Público |
| `/admin/dashboard` | ADMIN — lista de usuários |
| `/admin/usuarios/cadastro` | ADMIN, ADMINISTRATIVO |
| `/admin/usuarios/:id` | ADMIN — ver, editar e excluir |
