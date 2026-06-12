import './carregarAmbienteRaiz.js';

import prisma from '../../src/config/database.js';
import { ID_QUESITO_AREA_SINALIZADA, ID_QUESITO_USO_EPI } from './dados/identificadoresSeedConstantes.js';
import { obterIdCargoPorNome } from './utils/resolverReferenciasSeed.js';

const quesitosDados = [
    {
        id: ID_QUESITO_USO_EPI,
        nome: 'uso_epi_obrigatorio',
        descricao: 'O colaborador utiliza EPI adequado às atividades?',
        bloco: 'SST'
    },
    {
        id: ID_QUESITO_AREA_SINALIZADA,
        nome: 'area_sinalizada',
        descricao: 'A área de trabalho está sinalizada conforme normas?',
        bloco: 'SST'
    }
];

const vinculosCargoQuesitoConfig = [
    { nomeCargo: 'Pedreiro', quesitoId: ID_QUESITO_USO_EPI },
    { nomeCargo: 'Pedreiro', quesitoId: ID_QUESITO_AREA_SINALIZADA },
    { nomeCargo: 'Analista de Sistemas', quesitoId: ID_QUESITO_USO_EPI }
];

async function main() {
    console.log('Iniciando seed de quesitos...');

    for (const quesito of quesitosDados) {
        const existentePorNome = await prisma.quesito.findUnique({
            where: { nome: quesito.nome }
        });

        if (existentePorNome && existentePorNome.id !== quesito.id) {
            await prisma.quesito.delete({ where: { id: existentePorNome.id } });
        }

        await prisma.quesito.upsert({
            where: { id: quesito.id },
            update: {
                nome: quesito.nome,
                descricao: quesito.descricao,
                bloco: quesito.bloco
            },
            create: quesito
        });

        console.log(`- Quesito "${quesito.nome}" sincronizado.`);
    }

    for (const vinculoConfig of vinculosCargoQuesitoConfig) {
        const roleId = await obterIdCargoPorNome(vinculoConfig.nomeCargo);

        await prisma.roleQuesito.upsert({
            where: {
                roleId_quesitoId: {
                    roleId,
                    quesitoId: vinculoConfig.quesitoId
                }
            },
            update: {},
            create: {
                roleId,
                quesitoId: vinculoConfig.quesitoId
            }
        });
    }

    console.log('\n=== QUESITOS E VÍNCULOS CARGO-QUESITO ATUALIZADOS ===');
}

main()
    .catch((erro) => {
        console.error('Erro no seed de quesitos:', erro);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
