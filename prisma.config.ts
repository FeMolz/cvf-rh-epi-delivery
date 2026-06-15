import 'dotenv/config';

import { defineConfig } from 'prisma/config';

const urlMigracao = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!urlMigracao) {
    throw new Error(
        'Defina DIRECT_URL (Supabase, sessão/porta 5432) ou DATABASE_URL para o Prisma CLI.'
    );
}

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations'
    },
    datasource: {
        url: urlMigracao
    }
});
