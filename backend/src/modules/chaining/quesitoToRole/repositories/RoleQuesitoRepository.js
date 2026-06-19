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

    /**
     * @param {string} identificadorCargo
     * @param {string[]} identificadoresQuesito
     */
    async createManyLinks(identificadorCargo, identificadoresQuesito) {
        const resultado = await prisma.roleQuesito.createMany({
            data: identificadoresQuesito.map(identificadorQuesito => ({
                roleId: identificadorCargo,
                quesitoId: identificadorQuesito
            })),
            skipDuplicates: true
        });

        return resultado.count;
    }

    /**
     * @param {string} identificadorCargo
     * @param {string[]} identificadoresQuesito
     */
    async findManyByRoleIdAndQuesitoIds(identificadorCargo, identificadoresQuesito) {
        return prisma.roleQuesito.findMany({
            where: {
                roleId: identificadorCargo,
                quesitoId: { in: identificadoresQuesito }
            },
            include: {
                quesito: true,
                role: true
            },
            orderBy: { createdAt: 'asc' }
        });
    }
}

export default new RoleQuesitoRepository();
