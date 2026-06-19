import './carregarAmbienteRaiz.js';

import prisma from '../../src/config/database.js';
import {
    ID_CARGO_ANALISTA_SISTEMAS,
    ID_CARGO_AUXILIAR_ADMINISTRATIVO,
    ID_CARGO_PEDREIRO
} from './dados/identificadoresSeedConstantes.js';

const cargosDados = [
    {
        id: ID_CARGO_ANALISTA_SISTEMAS,
        name: 'Analista de Sistemas',
        description: 'Desenvolvimento, sustentação e integrações de sistemas.'
    },
    {
        id: ID_CARGO_PEDREIRO,
        name: 'Pedreiro',
        description: 'Execução de serviços de alvenaria e acabamento em obras.'
    },
    {
        id: ID_CARGO_AUXILIAR_ADMINISTRATIVO,
        name: 'Auxiliar Administrativo',
        description: 'Apoio administrativo, documentação e rotinas de RH.'
    }
];

async function main() {
    console.log('Iniciando seed de cargos...');

    for (const cargo of cargosDados) {
        await prisma.role.upsert({
            where: { name: cargo.name },
            update: {
                description: cargo.description
            },
            create: cargo
        });

        console.log(`- Cargo "${cargo.name}" sincronizado.`);
    }

    console.log('\n=== CARGOS ATUALIZADOS ===');
}

main()
    .catch((erro) => {
        console.error('Erro no seed de cargos:', erro);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
