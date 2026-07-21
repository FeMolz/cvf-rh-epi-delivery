import prisma from '../../../../config/database.js';

/**
 * @param {string} sufixo
 */
export async function criarEpiIntegracao(sufixo) {
    return prisma.epi.create({
        data: {
            name: `EPI Integração ${sufixo}`,
            caNumber: String(sufixo).replace(/\D/g, '').slice(-8).padStart(8, '1'),
            caExpirationDate: new Date('2030-12-31')
        }
    });
}

/**
 * @param {{ cargoId: string, epiId: string, periodicityDays?: number }} parametros
 */
export async function criarVinculoEpiCargoIntegracao({
    cargoId,
    epiId,
    periodicityDays = 180
}) {
    return prisma.roleEpi.create({
        data: {
            roleId: cargoId,
            epiId,
            periodicityDays
        }
    });
}
