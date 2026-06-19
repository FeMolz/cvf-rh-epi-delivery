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
npm run dev:frontend      # http://localhost:5173
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

O Vite faz **proxy** de `/api` → `localhost:3000` (não precisa configurar CORS em desenvolvimento).

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
