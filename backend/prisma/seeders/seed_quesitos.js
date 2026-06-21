import './carregarAmbienteRaiz.js';

import prisma from '../../src/config/database.js';
import {
    QUANTIDADE_QUESITOS_SEED,
    listarCargosAtivosSeed,
    listarQuesitosSeed,
    montarVinculosCargoQuesitoSeed
} from './dados/conteudoVolumeSeedTeste.js';
import { obterIdCargoPorNome } from './utils/resolverReferenciasSeed.js';

async function main() {
    console.log('Iniciando seed de quesitos...');

    const quesitosDados = listarQuesitosSeed();
    const cargosAtivos = listarCargosAtivosSeed();
    const vinculosCargoQuesitoConfig = montarVinculosCargoQuesitoSeed(cargosAtivos, quesitosDados);

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
    }

    console.log(`- ${quesitosDados.length} quesitos sincronizados.`);

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

    console.log(`- ${vinculosCargoQuesitoConfig.length} vínculos cargo/quesito sincronizados.`);
    console.log(`\n=== QUESITOS ATUALIZADOS (${QUANTIDADE_QUESITOS_SEED} registros) ===`);
}

main()
    .catch((erro) => {
        console.error('Erro no seed de quesitos:', erro);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
