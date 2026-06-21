import prisma from '../../../src/config/database.js';
import { EMPRESAS_SEED, SETORES_SEED } from '../dados/conteudoVolumeSeedTeste.js';

/**
 * Cria ou atualiza empresas e setores de teste (apenas ambiente de desenvolvimento/teste).
 */
export async function sincronizarEmpresasSetoresTeste() {
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
    }

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
    }
}
