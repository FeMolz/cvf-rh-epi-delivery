import prisma from '../../../config/database.js';

const SELECAO_PADRAO = {
    id: true,
    name: true,
    cnpj: true,
    isActive: true
};

class CompanyRepository {
    async findAllOrdered() {
        return prisma.company.findMany({
            select: SELECAO_PADRAO,
            orderBy: {
                name: 'asc'
            }
        });
    }

    async findById(id) {
        return prisma.company.findUnique({
            where: { id },
            select: SELECAO_PADRAO
        });
    }

    async findByCnpj(cnpj, idExcluido = null) {
        const filtros = { cnpj };

        if (idExcluido) {
            filtros.id = { not: idExcluido };
        }

        return prisma.company.findFirst({
            where: filtros,
            select: SELECAO_PADRAO
        });
    }

    async create({ name, cnpj, isActive = true }) {
        return prisma.company.create({
            data: { name, cnpj, isActive },
            select: SELECAO_PADRAO
        });
    }

    async update(id, { name, cnpj, isActive }) {
        return prisma.company.update({
            where: { id },
            data: { name, cnpj, isActive },
            select: SELECAO_PADRAO
        });
    }

    async deactivate(id) {
        return prisma.company.update({
            where: { id },
            data: { isActive: false },
            select: SELECAO_PADRAO
        });
    }

    async countEmployeesByCompanyId(id) {
        return prisma.employee.count({
            where: {
                companyId: id,
                deletedAt: null
            }
        });
    }
}

export default new CompanyRepository();
