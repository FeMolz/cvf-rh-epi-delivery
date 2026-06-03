import prisma from '../../../config/database.js';

class EpiDeliveryRepository {
    async createBatch(deliveriesData) {
        return prisma.epiDelivery.createMany({
            data: deliveriesData
        });
    }

    async findByEmployeeId(employeeId) {
        return prisma.epiDelivery.findMany({
            where: { employeeId },
            include: {
                epi: true,
                deliveredBy: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { deliveryDate: 'desc' }
        });
    }

    async findRoleEpisByRoleId(roleId) {
        return prisma.roleEpi.findMany({
            where: { roleId }
        });
    }

    async findDeliveriesByEmployeeIdAndDeliveryDateRange(employeeId, dataInicio, dataFim) {
        return prisma.epiDelivery.findMany({
            where: {
                employeeId,
                deliveryDate: {
                    gte: dataInicio,
                    lte: dataFim
                }
            },
            include: {
                epi: {
                    select: {
                        id: true,
                        name: true,
                        caNumber: true
                    }
                }
            },
            orderBy: { deliveryDate: 'asc' }
        });
    }
}

export default new EpiDeliveryRepository();
