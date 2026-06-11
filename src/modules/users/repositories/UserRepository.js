import prisma from '../../../config/database.js';

/** Campos retornados em consultas da API (sem passwordHash). */
export const SELECAO_USUARIO_CONSULTA = {
    id: true,
    name: true,
    email: true,
    role: true,
    isActive: true,
    lastLogin: true,
    createdAt: true,
    updatedAt: true
};

class UserRepository {
    async create(dadosCriacao) {
        return prisma.user.create({
            data: {
                ...dadosCriacao,
                isActive: false
            },
            select: SELECAO_USUARIO_CONSULTA
        });
    }

    async findByEmail(email) {
        return prisma.user.findUnique({
            where: { email }
        });
    }

    async findAll() {
        return prisma.user.findMany({
            select: SELECAO_USUARIO_CONSULTA,
            orderBy: { name: 'asc' }
        });
    }

    async findById(identificadorUsuario) {
        return prisma.user.findUnique({
            where: { id: identificadorUsuario },
            select: SELECAO_USUARIO_CONSULTA
        });
    }

    async findSessaoPorId(identificadorUsuario) {
        return prisma.user.findUnique({
            where: { id: identificadorUsuario },
            select: {
                id: true,
                email: true,
                role: true
            }
        });
    }

    async marcarUsuarioOnline(identificadorUsuario) {
        return prisma.user.update({
            where: { id: identificadorUsuario },
            data: {
                isActive: true,
                lastLogin: new Date()
            },
            select: SELECAO_USUARIO_CONSULTA
        });
    }

    async marcarUsuarioOffline(identificadorUsuario) {
        return prisma.user.update({
            where: { id: identificadorUsuario },
            data: { isActive: false },
            select: SELECAO_USUARIO_CONSULTA
        });
    }

    /**
     * @param {string} identificadorUsuario
     * @param {{ name?: string, email?: string, role?: string }} dadosAtualizacao
     */
    async update(identificadorUsuario, dadosAtualizacao) {
        return prisma.user.update({
            where: { id: identificadorUsuario },
            data: dadosAtualizacao,
            select: SELECAO_USUARIO_CONSULTA
        });
    }

    async delete(identificadorUsuario) {
        const existente = await this.findById(identificadorUsuario);

        if (!existente) {
            const erro = new Error('Usuário não encontrado');
            erro.code = 'NOT_FOUND';
            throw erro;
        }

        return prisma.user.delete({
            where: { id: identificadorUsuario },
            select: SELECAO_USUARIO_CONSULTA
        });
    }

    async changePassword(identificadorUsuario, hashSenha) {
        return prisma.user.update({
            where: { id: identificadorUsuario },
            data: { passwordHash: hashSenha },
            select: SELECAO_USUARIO_CONSULTA
        });
    }
}

export default new UserRepository();
