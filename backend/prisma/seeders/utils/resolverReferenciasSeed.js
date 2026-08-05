import prisma from '../../../src/config/database.js';
import { normalizarTextoMaiusculo } from '../../../src/shared/utils/normalizarTextoMaiusculo.js';

/**
 * @param {string} nomeCargo
 * @returns {Promise<string>}
 */
export async function obterIdCargoPorNome(nomeCargo) {
    const nomeNormalizado = normalizarTextoMaiusculo(nomeCargo);
    const cargo = await prisma.role.findUnique({
        where: { name: nomeNormalizado }
    });

    if (!cargo) {
        throw new Error(`Cargo "${nomeNormalizado}" não encontrado. Execute seed_cargos.js antes.`);
    }

    return cargo.id;
}
