# PostgreSQL em produção (Supabase)

O RH-System usa o **PostgreSQL do Supabase** em produção com duas URLs de conexão.

## Por que duas URLs?

| Variável       | Porta                        | Uso                                                         |
| -------------- | ---------------------------- | ----------------------------------------------------------- |
| `DATABASE_URL` | **6543** + `?pgbouncer=true` | API em runtime (pool transacional — muitas conexões curtas) |
| `DIRECT_URL`   | **5432**                     | Prisma CLI (`db push`, `migrate`) — sessão completa         |

A aplicação (`src/config/database.js`) usa **somente** `DATABASE_URL` via `@prisma/adapter-pg`.

O Prisma CLI lê `DIRECT_URL` em `prisma.config.ts` (fallback para `DATABASE_URL` em dev local).

## Configuração

1. Copie o template:

```bash
copy .env.production.example .env.production.local
```

2. No [painel Supabase](https://supabase.com/dashboard) → **Project Settings** → **Database**, copie a senha e substitua `[YOUR-PASSWORD]` nas duas URLs.

3. Preencha também `JWT_SECRET` (32+ chars), `CORS_ORIGINS`, `REDIS_URL` e demais variáveis de [SEGURANCA.md](./SEGURANCA.md).

## Aplicar schema no Supabase

```bash
npm run db:prod:push
```

Isso carrega `.env.production.local` e executa `prisma db push` usando `DIRECT_URL`.

## Rodar API apontando para Supabase

```bash
npm run dev:prod
```

## Primeiro admin em produção

```bash
npm run seed:admin:prod
```

Defina `ADMIN_SEED_EMAIL` e `ADMIN_SEED_PASSWORD` fortes em `.env.production.local` antes de executar.

## SSL

Conexões `*.supabase.com` habilitam TLS automaticamente em `montarPoolPostgres.js` (`rejectUnauthorized: false`).

## Desenvolvimento local

Continue usando `.env` com PostgreSQL local. **Não** misture URLs do Supabase no `.env` de desenvolvimento, a menos que esteja testando integração de propósito.

## Referências

- [Supabase + Prisma](https://supabase.com/docs/guides/database/prisma)
- [Prisma + PgBouncer](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer)
