# Execução por ambiente (desenvolvimento, teste e produção)

Guia único para subir o **RH-System** (API + frontend) nos três ambientes suportados. Detalhes de banco de teste, deploy no Render e segurança estão em documentos complementares linkados ao final.

---

## 1. Visão geral

O monorepo usa **npm workspaces** (`backend/` + `frontend/`). Cada ambiente é definido pelo **arquivo** `.env` carregado e pela **porta** em que a API responde:


| Ambiente                | Arquivo de config               | Banco típico             | API                         | Frontend                |
| ----------------------- | ------------------------------- | ------------------------ | --------------------------- | ----------------------- |
| **Desenvolvimento**     | `backend/.env`                  | PostgreSQL local (5432)  | `http://localhost:3000`     | `http://localhost:5173` |
| **Teste / homologação** | `backend/.env.test`             | PostgreSQL Docker (5433) | `http://localhost:3001`     | `http://localhost:5173` |
| **Produção**            | `backend/.env.production.local` | Supabase (nuvem)         | conforme deploy (ex.: 3000) | domínio do cliente      |


**Regra de ouro:** nunca aponte `.env` de desenvolvimento para o banco de produção. Use sempre o ambiente correto para cada tarefa.

---



## 2. Pré-requisitos comuns

- **Node.js** 20+
- **npm** (vem com o Node)
- **Git** e repositório clonado
- **PostgreSQL** (local, Docker ou Supabase conforme o ambiente)
- **Docker** (recomendado no Windows para banco de teste e stack de produção com CAEPI)

Instalação inicial (uma vez, na raiz do monorepo):

```bash
git clone https://github.com/FeMolz/CVF-System.git
cd CVF-System
npm install
```

---



## 3. Desenvolvimento (dia a dia)

Uso: codar features, testar com seus dados reais ou parciais no banco local.

### 3.1 Configurar ambiente

```bash
# Na pasta backend/ — crie o .env a partir do exemplo ou manualmente
cd backend
```

Arquivo `backend/.env` (exemplo mínimo):

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/NOME_DO_BANCO?schema=public"
JWT_SECRET="sua-chave-secreta-com-pelo-menos-16-caracteres"
JWT_EXPIRES_IN="7d"

# Opcional — seed do admin
# ADMIN_SEED_EMAIL="admin@rhsystem.com"
# ADMIN_SEED_PASSWORD="AlterarSenha123!"

# Supabase Storage (relatórios EPI) — bucket de dev, não use epi-reports de produção
# SUPABASE_URL="https://SEU-PROJETO.supabase.co"
# SUPABASE_SERVICE_ROLE_KEY=""
# SUPABASE_STORAGE_BUCKET_EPI_REPORTS="epi-reports-dev-teste"
```

Frontend (opcional — padrão já funciona):

```bash
# frontend/.env — proxy aponta para API na porta 3000
# RH_API_PORT=3000
# VITE_API_URL=/api/v1
```



### 3.2 Banco de dados

Na pasta `backend/`:

```bash
npx prisma db push
npx prisma generate
```



### 3.3 Seeds (primeira vez ou reset parcial)

```bash
# Só o administrador
npm run seed:admin -w backend

# Ou todos os módulos (empresas, cargos, funcionários, EPIs, etc.)
npm run seed:all -w backend
```



### 3.4 Subir API e frontend

**Opção A — dois terminais (recomendado para ver logs separados):**

```bash
# Terminal 1 — API
npm run dev:backend

# Terminal 2 — frontend
npm run dev:frontend
```

**Opção B — só API (Postman / Insomnia):**

```bash
npm run dev
```



### 3.5 Acessar


| Serviço      | URL                            |
| ------------ | ------------------------------ |
| API          | `http://localhost:3000`        |
| Health check | `http://localhost:3000/health` |
| Frontend     | `http://localhost:5173`        |
| Login        | `http://localhost:5173/login`  |




### 3.6 Credenciais padrão (seed)


| E-mail               | Senha              |
| -------------------- | ------------------ |
| `admin@rhsystem.com` | `AlterarSenha123!` |


(Senha usada quando `ADMIN_SEED_PASSWORD` não está definida no `.env`.)

### 3.7 Testes automatizados

```bash
npm test                    # backend (Jest, mocks)
npm run test:frontend       # frontend (Vitest)
npm run test:all            # ambos
```

---



## 4. Teste / homologação local

Uso: simular produção com **dados falsos completos** (50 funcionários, EPIs, entregas, etc.) sem risco ao banco de desenvolvimento.

### 4.1 Subir PostgreSQL de teste (Docker)

Na pasta `backend/`:

```bash
docker compose -f docker-compose.test.yml up -d
```

Se os containers já existirem mas estiverem parados:

```bash
docker start rh-system-postgres-teste rh-system-redis-teste
```

PostgreSQL de teste:

- Host: `localhost`
- Porta: **5433**
- Usuário / senha: `postgres` / `postgres`
- Banco: `rh_system_test`



### 4.2 Configurar `.env.test`

Na pasta `backend/`:

```powershell
# Windows (na raiz do monorepo)
copy backend\.env.test.example backend\.env.test

# Ou, já dentro de backend/
copy .env.test.example .env.test
```

Confira `DATABASE_URL`, `PORT` e Supabase Storage:

```env
PORT=3001
NODE_ENV=test
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/rh_system_test?schema=public"
JWT_SECRET="jwt-secreto-apenas-ambiente-teste-com-16-chars"

SUPABASE_URL="https://SEU-PROJETO.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_..."
SUPABASE_STORAGE_BUCKET_EPI_REPORTS="epi-reports-dev-teste"
```



### 4.3 Frontend em modo teste

Na pasta `frontend/`:

```powershell
copy .env.test.example .env.test
```

Conteúdo esperado:

```env
RH_API_PORT=3001
VITE_API_URL=/api/v1
```



### 4.4 Schema e seeds

Na raiz do monorepo:

```bash
npm run db:test:seed -w backend
```

Esse comando aplica o schema (`db push`) e executa o seed completo (`seed_sistema_completo.js`) usando `.env.test`.

Equivalentes:

```bash
npm run db:test:push -w backend    # só schema
npm run seed:all:test -w backend   # só seeds (com schema já aplicado)
```



### 4.5 Subir API e frontend de teste

**Opção A — um comando (raiz):**

```bash
npm run dev:test
```

Sobe API na **3001** e frontend na **5173** (proxy `/api` → 3001).

**Opção B — dois terminais:**

```bash
npm run dev:test:backend
npm run dev:test:frontend
```



### 4.6 Acessar


| Serviço            | URL                            |
| ------------------ | ------------------------------ |
| API de teste       | `http://localhost:3001`        |
| Frontend           | `http://localhost:5173`        |
| Postman (base URL) | `http://localhost:3001/api/v1` |




### 4.7 Credenciais padrão (seed de teste)


| E-mail                        | Papel          | Senha              |
| ----------------------------- | -------------- | ------------------ |
| `admin@rhsystem.com`          | ADMIN          | `AlterarSenha123!` |
| `administrativo@rhsystem.com` | ADMINISTRATIVO | `AlterarSenha123!` |
| `almoxarifado@rhsystem.com`   | ALMOXARIFADO   | `AlterarSenha123!` |
| `colaborador@rhsystem.com`    | COLABORADOR    | `AlterarSenha123!` |




### 4.8 Resetar banco de teste do zero

```bash
npm run db:test:reset -w backend
```



### 4.9 Problemas comuns


| Sintoma                                         | Solução                                                                                                     |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `Can't reach database server at localhost:5433` | Suba o Docker: `docker compose -f docker-compose.test.yml up -d` ou `docker start rh-system-postgres-teste` |
| Frontend chama API na 3000 em vez de 3001       | Use `npm run dev:test:frontend` e confira `frontend/.env.test` com `RH_API_PORT=3001`                       |
| Conflito de nome de container Docker            | `docker start rh-system-postgres-teste` em vez de `up -d`                                                   |


Mais detalhes: [BANCO_TESTE.md](./BANCO_TESTE.md).

---



## 5. Produção

Uso: ambiente real na nuvem (VPS + Supabase + Redis Cloud). **Não use seeds de desenvolvimento** em produção, exceto o admin inicial.

### 5.1 Configurar variáveis

Na pasta `backend/`:

```bash
copy .env.production.example .env.production.local
```

Preencha obrigatoriamente (ver [SEGURANCA.md](./SEGURANCA.md) e [SUPABASE.md](./SUPABASE.md)):

- `JWT_SECRET` (mínimo 32 caracteres)
- `DATABASE_URL` (Supabase pooler, porta 6543)
- `DIRECT_URL` (migrations, porta 5432)
- `REDIS_URL`
- `CORS_ORIGINS`
- `ADMIN_SEED_EMAIL` e `ADMIN_SEED_PASSWORD` (fortes)



### 5.2 Schema no Supabase

```bash
npm run db:prod:migrate -w backend
# Banco vazio / prototipagem: npm run db:prod:push -w backend
```



### 5.3 Admin inicial (apenas uma vez)

```bash
npm run seed:admin:prod -w backend
```



### 5.4 Subir a stack

**Docker (API + CAEPI na mesma máquina):**

```bash
npm run docker:prod:up -w backend
```

**Somente Node (CAEPI em outro host):**

```bash
npm run dev:prod -w backend
```

**Deploy automatizado no Render (após merge na** `main`**):**

O Render observa a branch `main` e faz build/deploy da API automaticamente. Configuração em [DEPLOY.md](./DEPLOY.md).

### 5.5 Validar

```bash
curl http://localhost:3000/health
```

Login: `POST /api/v1/users/login` com credenciais definidas no seed de produção.

### 5.6 Operação contínua


| Tarefa             | Comando                               |
| ------------------ | ------------------------------------- |
| Parar stack Docker | `npm run docker:prod:down -w backend` |
| Backup do banco    | `npm run backup:prod -w backend`      |
| Nova migration     | `npm run db:prod:migrate -w backend`  |


Guia completo: [DEPLOY.md](./DEPLOY.md).

---



## 6. Resumo de comandos (raiz do monorepo)


| Objetivo               | Comando                                |
| ---------------------- | -------------------------------------- |
| Dev — API              | `npm run dev` ou `npm run dev:backend` |
| Dev — frontend         | `npm run dev:frontend`                 |
| Teste — API + frontend | `npm run dev:test`                     |
| Teste — só API         | `npm run dev:test:backend`             |
| Teste — só frontend    | `npm run dev:test:frontend`            |
| Teste — popular banco  | `npm run db:test:seed -w backend`      |
| Produção — Docker      | `npm run docker:prod:up -w backend`    |
| Produção — migrations  | `npm run db:prod:migrate -w backend`   |
| Testes unitários       | `npm run test:all`                     |


---



## 7. Documentação relacionada


| Documento                                      | Conteúdo                            |
| ---------------------------------------------- | ----------------------------------- |
| [BANCO_TESTE.md](./BANCO_TESTE.md)             | Docker de teste, seeds e Postman    |
| [DEPLOY.md](./DEPLOY.md)                       | Dockerfile, CI/CD, backup, rollback |
| [SEGURANCA.md](./SEGURANCA.md)                 | JWT, CORS, rate limit, checklist    |
| [SUPABASE.md](./SUPABASE.md)                   | URLs do pooler e migrations         |
| [backend/README.md](../README.md)              | Módulos da API e seeds individuais  |
| [frontend/README.md](../../frontend/README.md) | Estrutura React e rotas             |


