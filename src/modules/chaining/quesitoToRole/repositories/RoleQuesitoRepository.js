import prisma from '../../../../config/database.js';

class RoleQuesitoRepository {
    /**
     * @param {string} identificadorCargo
     * @param {string} identificadorQuesito
     */
    async findByRoleIdAndQuesitoId(identificadorCargo, identificadorQuesito) {
        return prisma.roleQuesito.findUnique({
            where: {
                roleId_quesitoId: {
                    roleId: identificadorCargo,
                    quesitoId: identificadorQuesito
                }
            }
        });
    }

    /**
     * @param {string} identificadorCargo
     * @param {string} identificadorQuesito
     */
    async createLink(identificadorCargo, identificadorQuesito) {
        return prisma.roleQuesito.create({
            data: {
                roleId: identificadorCargo,
                quesitoId: identificadorQuesito
            },
            include: {
                quesito: true,
                role: true
            }
        });
    }

    /**
     * @param {string} identificadorCargo
     * @param {string} identificadorQuesito
     */
    async deleteByRoleIdAndQuesitoId(identificadorCargo, identificadorQuesito) {
        return prisma.roleQuesito.delete({
            where: {
                roleId_quesitoId: {
                    roleId: identificadorCargo,
                    quesitoId: identificadorQuesito
                }
            }
        });
    }

    /**
     * @param {string} identificadorCargo
     */
    async findManyByRoleIdWithQuesito(identificadorCargo) {
        return prisma.roleQuesito.findMany({
            where: { roleId: identificadorCargo },
            include: {
                quesito: true
            },
            orderBy: { createdAt: 'asc' }
        });
    }
}

export default new RoleQuesitoRepository();
