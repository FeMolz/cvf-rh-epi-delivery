import prisma from '../../../src/config/database.js';

/**
 * @param {string} nomeCargo
 * @returns {Promise<string>}
 */
export async function obterIdCargoPorNome(nomeCargo) {
    const cargo = await prisma.role.findUnique({
        where: { name: nomeCargo }
    });

    if (!cargo) {
        throw new Error(`Cargo "${nomeCargo}" não encontrado. Execute seed_cargos.js antes.`);
    }

    return cargo.id;
}
