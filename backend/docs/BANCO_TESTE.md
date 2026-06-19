# Banco de dados de teste (homologação local)

Use um PostgreSQL **separado** do banco de desenvolvimento/produção para testes manuais no Postman. Assim você pode apagar dados, rodar seeds e emitir PDFs sem risco.

---

## 1. Criar o banco

### Opção A — Docker (recomendado no Windows)

Na raiz do projeto:

```bash
docker compose -f docker-compose.test.yml up -d
```

Isso sobe PostgreSQL na porta **5433** com:

- Usuário: `postgres`
- Senha: `postgres`
- Banco: `rh_system_test`

### Opção B — PostgreSQL instalado localmente

No `psql` ou pgAdmin:

```sql
CREATE DATABASE rh_system_test;
```

Use uma `DATABASE_URL` com porta **5432** (ou a sua padrão).

---

## 2. Arquivo de ambiente `.env.test`

```bash
copy .env.test.example .env.test
```

Edite `.env.test` e confira a `DATABASE_URL`. Exemplo com Docker acima:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/rh_system_test?schema=public"
PORT=3001
JWT_SECRET="jwt-secreto-apenas-ambiente-teste"
```

**Nunca** commite `.env.test` com senhas reais de produção. O `.gitignore` deve ignorar `.env*`.

---

## 3. Aplicar o schema (tabelas)

O Prisma 7 **não** aceita `--env-file`. Use os scripts npm (carregam `.env.test` e passam `--url` ao Prisma):

```bash
npm run db:test:push
```

Equivalente a migrations em banco vazio; adequado para ambiente de teste.

---

## 4. Popular dados iniciais (seeds)

Popula **todos os módulos** (usuários, empresas, setores, cargos, funcionários, EPIs, quesitos, entregas, relatórios PDF, recrutamento e auditoria):

```bash
npm run db:test:seed
```

Equivalente manual:

```bash
npm run seed:all:test
```

Em desenvolvimento (`.env`):

```bash
npm run seed:all
```

### Credenciais padrão dos usuários de seed


| E-mail                        | Papel          | Senha                                         |
| ----------------------------- | -------------- | --------------------------------------------- |
| `admin@rhsystem.com`          | ADMIN          | `AlterarSenha123!` (ou `ADMIN_SEED_PASSWORD`) |
| `administrativo@rhsystem.com` | ADMINISTRATIVO | `AlterarSenha123!`                            |
| `almoxarifado@rhsystem.com`   | ALMOXARIFADO   | `AlterarSenha123!`                            |
| `colaborador@rhsystem.com`    | COLABORADOR    | `AlterarSenha123!`                            |


### EPIs via API externa (opcional)

Requer `CAEPI_API_URL` rodando:

```bash
node prisma/scripts/executar-com-ambiente-teste.mjs prisma/seeders/seed_epis.js
```

Token JWT para o Postman:

```bash
node prisma/scripts/executar-com-ambiente-teste.mjs prisma/seeders/generate-dev-token.js
```

---

## 5. Subir a API usando o banco de teste

```bash
npm run dev:test
```

Na **raiz do monorepo**, isso sobe API + frontend já com proxy na porta correta.

Somente a API:

```bash
npm run dev:test:backend
```

Isso usa `PORT` e `DATABASE_URL` de `.env.test` (porta **3001** no exemplo, para não conflitar com `npm run dev` no 3000).

Base URL no Postman: `http://localhost:3001`

### Frontend apontando para a API de teste

O proxy do Vite usa a variável `RH_API_PORT` (padrão **3000**). No modo teste ela é **3001** (`frontend/.env.test`).

**Opção recomendada — um comando na raiz do monorepo:**

```bash
npm run dev:test
```

Sobe API (`dev:test` no backend, porta 3001) e frontend (`vite --mode test`, proxy na 3001).

**Dois terminais:**

```bash
npm run dev:test:backend
npm run dev:test:frontend
```

Para desenvolvimento normal (banco `.env`, porta 3000): `npm run dev:backend` + `npm run dev:frontend`.

---

## 6. Resetar o banco de teste (começar do zero)

```bash
npm run db:test:reset
```

Apaga o volume Docker (se usar compose de teste), recria schema e roda seeds básicos.

---

## 7. Desenvolvimento vs teste vs produção


| Ambiente     | Arquivo env | Banco             | Uso                    |
| ------------ | ----------- | ----------------- | ---------------------- |
| Dev diário   | `.env`      | `rh_system` (ex.) | Codar no dia a dia     |
| Teste manual | `.env.test` | `rh_system_test`  | Postman, PDF, Secullum |
| Produção     | servidor    | cliente           | Deploy                 |


Os testes Jest unitários (`npm test`) usam mocks. Para validar filtros de funcionários e pausa de EPI contra o banco real:

```bash
docker compose -f docker-compose.test.yml up -d
npm run db:test:push
set RUN_INTEGRATION_TESTS=true
npm run test:integracao
```

No CI (GitHub Actions), os testes de integração rodam automaticamente com PostgreSQL após `prisma db push`.

---

## 8. Checklist rápido

1. `docker compose -f docker-compose.test.yml up -d`
2. `copy .env.test.example .env.test`
3. `npm run db:test:push`
4. `npm run db:test:seed`
5. `npm run dev:test` (API + frontend) ou `npm run dev:test:backend` + `npm run dev:test:frontend`
6. Navegador → `http://localhost:5173` ou Postman → `http://127.0.0.1:3001`

