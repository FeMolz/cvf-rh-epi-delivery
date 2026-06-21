import './carregarAmbienteRaiz.js';

import prisma from '../../src/config/database.js';
import { SETORES_SEED } from './dados/conteudoVolumeSeedTeste.js';

async function main() {
    try {
        console.log('Iniciando o cadastro/atualização dos setores...');

        for (const setor of SETORES_SEED) {
            const existente = await prisma.setor.findUnique({ where: { nome: setor.nome } });

            if (existente && existente.id !== setor.id) {
                await prisma.setor.delete({ where: { id: existente.id } });
            }

            await prisma.setor.upsert({
                where: { id: setor.id },
                update: { nome: setor.nome },
                create: setor
            });

            console.log(`- Setor "${setor.nome}" sincronizado (UUID fixo).`);
        }

        console.log('\n=== TODOS OS SETORES ATUALIZADOS NO BANCO ===');
    } catch (erro) {
        console.error('Erro ao criar/atualizar setores:', erro);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
