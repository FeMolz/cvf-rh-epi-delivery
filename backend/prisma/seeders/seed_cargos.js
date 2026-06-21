import './carregarAmbienteRaiz.js';

import prisma from '../../src/config/database.js';
import {
    QUANTIDADE_CARGOS_ATIVOS_SEED,
    QUANTIDADE_CARGOS_INATIVOS_SEED,
    listarCargosAtivosSeed,
    listarCargosInativosSeed
} from './dados/conteudoVolumeSeedTeste.js';

async function main() {
    console.log('Iniciando seed de cargos...');

    const cargosAtivos = listarCargosAtivosSeed();
    const cargosInativos = listarCargosInativosSeed();

    for (const cargo of cargosAtivos) {
        await prisma.role.upsert({
            where: { name: cargo.name },
            update: {
                description: cargo.description,
                deletedAt: null
            },
            create: {
                id: cargo.id,
                name: cargo.name,
                description: cargo.description,
                deletedAt: null
            }
        });
    }

    for (const cargo of cargosInativos) {
        await prisma.role.upsert({
            where: { name: cargo.name },
            update: {
                description: cargo.description,
                deletedAt: cargo.deletedAt
            },
            create: cargo
        });
    }

    console.log(`- ${cargosAtivos.length} cargos ativos sincronizados.`);
    console.log(`- ${cargosInativos.length} cargos inativos sincronizados.`);
    console.log(
        `\n=== CARGOS ATUALIZADOS (${QUANTIDADE_CARGOS_ATIVOS_SEED} ativos + ${QUANTIDADE_CARGOS_INATIVOS_SEED} inativos) ===`
    );
}

main()
    .catch((erro) => {
        console.error('Erro no seed de cargos:', erro);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
