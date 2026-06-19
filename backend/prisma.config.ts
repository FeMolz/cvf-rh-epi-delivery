import 'dotenv/config';

import { defineConfig } from 'prisma/config';

/**
 * URL usada pelo Prisma CLI (migrate, db push). Em `prisma generate` (postinstall/CI/Docker)
 * não há banco real — fallback local evita falha quando DIRECT_URL/DATABASE_URL não estão no ambiente.
 */
const urlMigracao =
    process.env.DIRECT_URL ||
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@127.0.0.1:5432/postgres?schema=public';

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations'
    },
    datasource: {
        url: urlMigracao
    }
});
