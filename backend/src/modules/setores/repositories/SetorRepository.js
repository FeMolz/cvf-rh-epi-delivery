import prisma from '../../../config/database.js';

const SELECAO_PADRAO = {
    id: true,
    nome: true,
    isActive: true
};

class SetorRepository {
    async findAllOrdered() {
        return prisma.setor.findMany({
            select: SELECAO_PADRAO,
            orderBy: {
                nome: 'asc'
            }
        });
    }

    async findById(id) {
        return prisma.setor.findUnique({
            where: { id },
            select: SELECAO_PADRAO
        });
    }

    async findByNome(nome, idExcluido = null) {
        const filtros = { nome };

        if (idExcluido) {
            filtros.id = { not: idExcluido };
        }

        return prisma.setor.findFirst({
            where: filtros,
            select: SELECAO_PADRAO
        });
    }

    async create({ nome, isActive = true }) {
        return prisma.setor.create({
            data: { nome, isActive },
            select: SELECAO_PADRAO
        });
    }

    async update(id, { nome, isActive }) {
        return prisma.setor.update({
            where: { id },
            data: { nome, isActive },
            select: SELECAO_PADRAO
        });
    }

    async deactivate(id) {
        return prisma.setor.update({
            where: { id },
            data: { isActive: false },
            select: SELECAO_PADRAO
        });
    }

    async countEmployeesBySetorId(id) {
        return prisma.employee.count({
            where: {
                setorId: id,
                deletedAt: null
            }
        });
    }
}

export default new SetorRepository();
