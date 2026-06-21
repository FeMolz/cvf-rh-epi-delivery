import './carregarAmbienteRaiz.js';

import prisma from '../../src/config/database.js';
import {
    QUANTIDADE_CARGOS_COM_MINIMO_EPIS,
    QUANTIDADE_EPIS_SEED,
    MINIMO_EPIS_POR_CARGO_PRIORITARIO,
    listarCargosAtivosSeed,
    listarEpisSeed,
    montarVinculosCargoEpiSeed
} from './dados/conteudoVolumeSeedTeste.js';
import { obterIdCargoPorNome } from './utils/resolverReferenciasSeed.js';

async function main() {
    console.log('Iniciando seed de EPIs locais (sem API CAEPI)...');

    const episDados = listarEpisSeed();
    const cargosAtivos = listarCargosAtivosSeed();
    const vinculosCargoEpiConfig = montarVinculosCargoEpiSeed(episDados, cargosAtivos);

    for (const epi of episDados) {
        const existentePorCa = await prisma.epi.findUnique({
            where: { caNumber: epi.caNumber }
        });

        if (existentePorCa && existentePorCa.id !== epi.id) {
            await prisma.epi.delete({ where: { id: existentePorCa.id } });
        }

        await prisma.epi.upsert({
            where: { id: epi.id },
            update: {
                name: epi.name,
                caNumber: epi.caNumber,
                caExpirationDate: epi.caExpirationDate,
                isActive: true
            },
            create: {
                ...epi,
                isActive: true
            }
        });
    }

    console.log(`- ${episDados.length} EPIs sincronizados.`);

    for (const vinculoConfig of vinculosCargoEpiConfig) {
        const roleId = await obterIdCargoPorNome(vinculoConfig.nomeCargo);

        await prisma.roleEpi.upsert({
            where: {
                roleId_epiId: {
                    roleId,
                    epiId: vinculoConfig.epiId
                }
            },
            update: {
                periodicityDays: vinculoConfig.periodicityDays
            },
            create: {
                roleId,
                epiId: vinculoConfig.epiId,
                periodicityDays: vinculoConfig.periodicityDays
            }
        });
    }

    console.log(`- ${vinculosCargoEpiConfig.length} vínculos cargo/EPI sincronizados.`);
    console.log(
        `\n=== EPIS E VÍNCULOS ATUALIZADOS (${QUANTIDADE_EPIS_SEED} EPIs; ${QUANTIDADE_CARGOS_COM_MINIMO_EPIS} cargos com >= ${MINIMO_EPIS_POR_CARGO_PRIORITARIO} EPIs) ===`
    );
}

main()
    .catch((erro) => {
        console.error('Erro no seed de EPIs locais:', erro);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
