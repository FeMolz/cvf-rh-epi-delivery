import './carregarAmbienteRaiz.js';

import prisma from '../../src/config/database.js';

const setoresDados = [
    { id: '10101010-1010-1010-1010-101010101010', nome: 'ADMINISTRATIVO' },
    { id: '20202020-2020-2020-2020-202020202020', nome: 'OBRAS' },
    { id: '30303030-3030-3030-3030-303030303030', nome: 'TI' },
    { id: '40404040-4040-4040-4040-404040404040', nome: 'MARKETING' },
    { id: '50505050-5050-5050-5050-505050505050', nome: 'ENGENHARIA' },
    { id: '60606060-6060-6060-6060-606060606060', nome: 'ALMOXARIFADO' },
    { id: '70707070-7070-7070-7070-707070707070', nome: 'VIVANT' },
    { id: '80808080-8080-8080-8080-808080808080', nome: 'RIO SPORTS' }
];

async function main() {
    try {
        console.log('Iniciando o cadastro/atualização dos setores...');

        for (const setor of setoresDados) {
            const existente = await prisma.setor.findUnique({ where: { nome: setor.nome } });
            if (existente && existente.id !== setor.id) {
                await prisma.setor.delete({ where: { id: existente.id } });
            }

            await prisma.setor.upsert({
                where: { id: setor.id },
                update: { nome: setor.nome },
                create: {
                    id: setor.id,
                    nome: setor.nome
                }
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
