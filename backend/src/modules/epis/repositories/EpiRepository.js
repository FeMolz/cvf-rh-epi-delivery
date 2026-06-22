import prisma from '../../../config/database.js';

class EpiRepository {
    async findByCaNumber(caNumber) {
        return prisma.epi.findUnique({
            where: { caNumber: String(caNumber) }
        });
    }

    async createEpi(epiData) {
        return prisma.epi.create({
            data: epiData
        });
    }

    async findAllEpis() {
        return prisma.epi.findMany();
    }

    /**
     * @param {string} termo
     * @param {number} limite
     * @returns {Promise<Array<{ caNumber: string, name: string }>>}
     */
    async findAtivosPorNomeContendo(termo, limite) {
        return prisma.epi.findMany({
            where: {
                isActive: true,
                name: {
                    contains: termo,
                    mode: 'insensitive'
                }
            },
            take: limite,
            select: {
                caNumber: true,
                name: true
            },
            orderBy: { name: 'asc' }
        });
    }

    async findRoleEpiByCompositeKey(roleId, epiId) {
        return prisma.roleEpi.findUnique({
            where: {
                roleId_epiId: {
                    roleId,
                    epiId
                }
            }
        });
    }

    async updateRoleEpiPeriodicity(roleId, epiId, periodicityDays) {
        return prisma.roleEpi.update({
            where: {
                roleId_epiId: {
                    roleId,
                    epiId
                }
            },
            data: {
                periodicityDays
            }
        });
    }
}

export default new EpiRepository();
