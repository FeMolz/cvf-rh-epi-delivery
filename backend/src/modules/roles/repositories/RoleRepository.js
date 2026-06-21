import prisma from '../../../config/database.js';

class RoleRepository {
    async create(name, description) {
        return prisma.role.create({
            data: {
                name,
                description
            }
        });
    }

    /**
     * @param {{ incluirInativos?: boolean, apenasInativos?: boolean }} [opcoes]
     */
    async findAll({ incluirInativos = false, apenasInativos = false } = {}) {
        let where;

        if (apenasInativos) {
            where = { deletedAt: { not: null } };
        } else if (!incluirInativos) {
            where = { deletedAt: null };
        }

        return prisma.role.findMany({
            where,
            include: {
                _count: {
                    select: { roleEpis: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    async findById(id) {
        return prisma.role.findUnique({
            where: {
                id
            },
            include: {
                _count: {
                    select: { roleEpis: true }
                }
            }
        });
    }

    async findByName(name) {
        return prisma.role.findFirst({
            where: {
                name,
                deletedAt: null
            }
        });
    }

    async update(id, name, description) {
        return prisma.role.update({
            where: {
                id
            },
            data: {
                name,
                description
            }
        });
    }

    async softDelete(id) {
        return prisma.role.update({
            where: {
                id
            },
            data: {
                deletedAt: new Date()
            }
        });
    }

    async count() {
        return prisma.role.count({
            where: { deletedAt: null }
        });
    }

    async exists(id) {
        const quantidade = await prisma.role.count({
            where: {
                id,
                deletedAt: null
            }
        });

        return quantidade > 0;
    }

    async countEmployeesByRoleId(id) {
        return prisma.employee.count({
            where: {
                roleId: id,
                deletedAt: null
            }
        });
    }

    async isNameUnique(name, id = null) {
        const filtros = {
            name,
            deletedAt: null
        };

        if (id) {
            filtros.id = { not: id };
        }

        const quantidade = await prisma.role.count({
            where: filtros
        });

        return quantidade === 0;
    }
}

export default new RoleRepository();
