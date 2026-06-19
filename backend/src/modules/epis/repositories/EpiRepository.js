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
