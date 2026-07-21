import prisma from '../../../../config/database.js';

/**
 * @param {string} sufixo
 */
export async function criarEmpresaIntegracao(sufixo) {
    return prisma.company.create({
        data: {
            name: `Empresa Integração ${sufixo}`,
            cnpj: `${String(sufixo).replace(/\D/g, '').slice(-14).padStart(14, '0')}`
        }
    });
}

/**
 * @param {string} sufixo
 */
export async function criarSetorIntegracao(sufixo) {
    return prisma.setor.create({
        data: { nome: `Setor Integração ${sufixo}` }
    });
}
