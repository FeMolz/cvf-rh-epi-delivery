import prisma from '../../../../config/database.js';

/**
 * @param {{
 *   employeeId: string,
 *   epiId: string,
 *   deliveredById: string,
 *   deliveryDate?: Date,
 *   nextDueDate?: Date | null
 * }} parametros
 */
export async function criarEntregaEpiIntegracao(parametros) {
    return prisma.epiDelivery.create({
        data: {
            employeeId: parametros.employeeId,
            epiId: parametros.epiId,
            deliveredById: parametros.deliveredById,
            deliveryDate: parametros.deliveryDate ?? new Date('2025-12-01'),
            nextDueDate: parametros.nextDueDate ?? new Date('2026-06-01')
        }
    });
}
