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

    async findAll() {
        return prisma.role.findMany();
    }

    async findById(id) {
        return prisma.role.findUnique({
            where: {
                id
            }
        });
    }

    async findByName(name) {
        return prisma.role.findUnique({
            where: {
                name
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

    async delete(id) {
        return prisma.role.delete({
            where: {
                id
            }
        });
    }

    async count() {
        return prisma.role.count();
    }

    async exists(id) {
        const role = await this.findById(id);
        return !!role;
    }

    async isNameUnique(name, id = null) {
        const query = {
            where: {
                name
            }
        };

        if (id) {
            query.where.id = {
                not: id
            };
        }

        const count = await prisma.role.count(query);
        return count === 0;
    }
}

export default new RoleRepository();