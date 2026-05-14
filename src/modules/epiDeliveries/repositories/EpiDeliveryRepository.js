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

    async findEmployeeById(employeeId) {
        return prisma.employee.findUnique({
            where: { id: employeeId },
            select: { id: true, roleId: true }
        });
    }
}

export default new EpiDeliveryRepository();
