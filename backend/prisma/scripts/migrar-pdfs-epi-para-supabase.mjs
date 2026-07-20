import './carregarAmbienteRaiz.js';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';

import supabaseStorageProvider from '../../src/shared/providers/SupabaseStorageProvider/SupabaseStorageProvider.js';
import { montarPathRelatorioEpi } from '../../src/shared/providers/SupabaseStorageProvider/montarPathRelatorioEpi.js';
import { MENSAGEM_SUPABASE_STORAGE_NAO_CONFIGURADO } from '../../src/shared/providers/SupabaseStorageProvider/constants/storageConstantes.js';

const { Pool } = pg;

function obterConnectionString() {
    return process.env.DIRECT_URL || process.env.DATABASE_URL;
}

async function colunaExiste(pool, nomeColuna) {
    const resultado = await pool.query(
        `
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'EpiDeliveryReport'
          AND column_name = $1
        LIMIT 1
        `,
        [nomeColuna]
    );

    return resultado.rowCount > 0;
}

async function main() {
    const connectionString = obterConnectionString();

    if (!connectionString) {
        throw new Error('Defina DIRECT_URL ou DATABASE_URL para executar a migracao.');
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error(MENSAGEM_SUPABASE_STORAGE_NAO_CONFIGURADO);
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const possuiPdfConteudo = await colunaExiste(pool, 'pdfConteudo');
        const possuiPdfStoragePath = await colunaExiste(pool, 'pdfStoragePath');

        if (!possuiPdfConteudo) {
            console.log('Coluna pdfConteudo ausente. Nada a migrar.');
            return;
        }

        if (!possuiPdfStoragePath) {
            throw new Error(
                'Aplique a migration 20260718183000_epi_delivery_report_pdf_supabase_storage antes deste script.'
            );
        }

        const relatoriosPendentes = await pool.query(
            `
            SELECT id, "employeeId", "pdfConteudo"
            FROM "EpiDeliveryReport"
            WHERE "pdfStoragePath" IS NULL
              AND "pdfConteudo" IS NOT NULL
            `
        );

        if (relatoriosPendentes.rowCount === 0) {
            console.log('Nenhum relatorio pendente de migracao para o Supabase Storage.');
            return;
        }

        const bucket = supabaseStorageProvider.obterBucketRelatoriosEpi();
        let migrados = 0;

        for (const relatorio of relatoriosPendentes.rows) {
            const bufferPdf = Buffer.from(relatorio.pdfConteudo);
            const pathPdf = montarPathRelatorioEpi(relatorio.employeeId, relatorio.id);

            await supabaseStorageProvider.uploadArquivo({
                bucket,
                path: pathPdf,
                buffer: bufferPdf
            });

            await prisma.epiDeliveryReport.update({
                where: { id: relatorio.id },
                data: {
                    pdfStoragePath: pathPdf,
                    pdfTamanhoBytes: bufferPdf.length
                }
            });

            migrados += 1;
            console.log(`- Migrado relatorio ${relatorio.id} -> ${pathPdf}`);
        }

        console.log(`\nMigracao concluida: ${migrados} relatorio(s) enviado(s) ao bucket "${bucket}".`);
        console.log('Aplique a migration 20260718183100_epi_delivery_report_pdf_supabase_storage_finalize em seguida.');
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main().catch((erro) => {
    console.error('Erro ao migrar PDFs de EPI para o Supabase Storage:', erro);
    process.exit(1);
});
