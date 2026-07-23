import prisma from '../../../../config/database.js';

/**
 * @param {string} sufixo
 */
export async function criarCargoIntegracao(sufixo) {
    return prisma.role.create({
        data: {
            name: `Cargo Integração ${sufixo}`,
            description: 'Cargo para testes de integração'
        }
    });
}
