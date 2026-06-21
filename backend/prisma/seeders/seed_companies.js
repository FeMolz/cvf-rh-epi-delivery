import './carregarAmbienteRaiz.js';

import prisma from '../../src/config/database.js';
import { EMPRESAS_SEED } from './dados/conteudoVolumeSeedTeste.js';

async function main() {
    try {
        console.log(`Iniciando o cadastro/atualização das ${EMPRESAS_SEED.length} empresas...`);

        for (const empresa of EMPRESAS_SEED) {
            const existente = await prisma.company.findUnique({ where: { cnpj: empresa.cnpj } });

            if (existente && existente.id !== empresa.id) {
                await prisma.company.delete({ where: { id: existente.id } });
            }

            await prisma.company.upsert({
                where: { id: empresa.id },
                update: {
                    name: empresa.name,
                    cnpj: empresa.cnpj
                },
                create: empresa
            });

            console.log(`- Empresa "${empresa.name}" sincronizada com segurança (UUID fixo).`);
        }

        console.log('\n=== TODAS AS EMPRESAS ATUALIZADAS NO BANCO ===');
    } catch (erro) {
        console.error('Erro ao criar/atualizar empresas:', erro);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
