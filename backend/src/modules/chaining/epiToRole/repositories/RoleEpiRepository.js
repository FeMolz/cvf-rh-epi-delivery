import prisma from '../../../../config/database.js';

class RoleEpiRepository {
    /**
     * @param {string} roleId
     * @param {string} epiId
     */
    async findByRoleAndEpi(roleId, epiId) {
        return prisma.roleEpi.findUnique({
            where: {
                roleId_epiId: {
                    roleId,
                    epiId
                }
            }
        });
    }

    /**
     * @param {string} roleId
     */
    async findManyByRole(roleId) {
        return prisma.roleEpi.findMany({
            where: { roleId },
            include: {
                epi: true
            }
        });
    }

    /**
     * @param {{ roleId: string, epiId: string, periodicityDays: number }} dadosVinculo
     */
    async create(dadosVinculo) {
        return prisma.roleEpi.create({
            data: dadosVinculo,
            include: {
                epi: true,
                role: true
            }
        });
    }

    /**
     * @param {string} roleId
     * @param {string} epiId
     */
    async deleteByRoleAndEpi(roleId, epiId) {
        return prisma.roleEpi.delete({
            where: {
                roleId_epiId: {
                    roleId,
                    epiId
                }
            }
        });
    }
}

export default new RoleEpiRepository();
