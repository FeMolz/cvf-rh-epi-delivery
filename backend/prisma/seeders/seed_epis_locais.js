import './carregarAmbienteRaiz.js';

import prisma from '../../src/config/database.js';
import { ID_EPI_CAPACETE, ID_EPI_LUVA } from './dados/identificadoresSeedConstantes.js';
import { obterIdCargoPorNome } from './utils/resolverReferenciasSeed.js';

const episDados = [
    {
        id: ID_EPI_CAPACETE,
        name: 'Capacete de Segurança',
        caNumber: '11070',
        caExpirationDate: new Date('2028-12-31')
    },
    {
        id: ID_EPI_LUVA,
        name: 'Luva de Proteção',
        caNumber: '4280',
        caExpirationDate: new Date('2027-06-30')
    }
];

const vinculosCargoEpiConfig = [
    { nomeCargo: 'Analista de Sistemas', epiId: ID_EPI_CAPACETE, periodicityDays: 365 },
    { nomeCargo: 'Pedreiro', epiId: ID_EPI_CAPACETE, periodicityDays: 180 },
    { nomeCargo: 'Pedreiro', epiId: ID_EPI_LUVA, periodicityDays: 90 }
];

async function main() {
    console.log('Iniciando seed de EPIs locais (sem API CAEPI)...');

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

        console.log(`- EPI CA ${epi.caNumber} sincronizado.`);
    }

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

        console.log(`- Vínculo cargo/EPI "${vinculoConfig.nomeCargo}" sincronizado.`);
    }

    console.log('\n=== EPIS E VÍNCULOS CARGO-EPI ATUALIZADOS ===');
}

main()
    .catch((erro) => {
        console.error('Erro no seed de EPIs locais:', erro);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
