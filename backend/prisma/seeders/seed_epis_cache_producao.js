import './carregarAmbienteRaiz.js';

import prisma from '../../src/config/database.js';
import { EPIS_COMUNS_CACHE } from './dados/episComunsCacheConstantes.js';

/**
 * Popula o cache PostgreSQL com EPIs reais e válidos (sem chamar a API CAEPI).
 * Não cria vínculos cargo↔EPI — o cliente vincula manualmente na interface.
 */
async function main() {
    console.log('Iniciando seed de EPIs comuns em cache (sem API CAEPI, sem vínculos)...');

    for (const epi of EPIS_COMUNS_CACHE) {
        await prisma.epi.upsert({
            where: { caNumber: epi.caNumber },
            update: {
                name: epi.name,
                caExpirationDate: new Date(`${epi.caExpirationDate}T12:00:00.000Z`),
                isActive: true
            },
            create: {
                caNumber: epi.caNumber,
                name: epi.name,
                caExpirationDate: new Date(`${epi.caExpirationDate}T12:00:00.000Z`),
                isActive: true
            }
        });
    }

    console.log(`✅ ${EPIS_COMUNS_CACHE.length} EPIs comuns sincronizados no cache.`);
    console.log('   Vínculos com cargos: configure em EPIs → Vínculo com cargo.');
}

main()
    .catch((erro) => {
        console.error('Erro no seed de EPIs em cache:', erro);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
