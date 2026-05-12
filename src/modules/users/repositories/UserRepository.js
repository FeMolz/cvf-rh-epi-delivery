import prisma from '../../../config/database.js';

class UserRepository {
    async create(data) {
        const user = await prisma.user.create({
            data,

            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });
        return user;
    }

    async findByEmail(email) {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        return user;
    }

    async findAll() {
        return prisma.user.findMany();
    }

    async update(id, data) {
        return prisma.user.update({
            where: { id },
            data
        });
    }

    // UserRepository - adiciona findById
async findById(id) {
    return prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, role: true }
    });
}

// Atualiza método delete para usar findById antes de excluir
async delete(id) {
    // Verifica se o usuário existe antes de tentar deletar
    const existing = await this.findById(id);
    if (!existing) {
        // Lança erro que será capturado no controller
        const error = new Error('Usuário não encontrado');
        error.code = 'NOT_FOUND';
        throw error;
    }
    return prisma.user.delete({
        where: { id }
    });
}

    async changePassword(id, newPassword) {
        return prisma.user.update({
            where: { id },
            data: { passwordHash: newPassword }
        });
    }
}

export default new UserRepository();