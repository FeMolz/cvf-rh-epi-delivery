import prisma from '../../../../config/database.js';

export async function verificarConexaoBancoIntegracao() {
    try {
        await prisma.$queryRaw`SELECT 1`;
    } catch (erro) {
        const urlMascarada =
            process.env.DATABASE_URL?.replace(/:([^:@/]+)@/, ':***@') ?? '(não definida)';

        throw new Error(
            `Banco de integração indisponível em ${urlMascarada}. ` +
                'Suba o Postgres de teste e aplique o schema: ' +
                'docker compose -f docker-compose.test.yml up -d && npm run db:test:push. ' +
                `Detalhe: ${erro.message}`
        );
    }
}

export function integracaoHabilitada() {
    return process.env.RUN_INTEGRATION_TESTS === 'true' && Boolean(process.env.DATABASE_URL);
}
