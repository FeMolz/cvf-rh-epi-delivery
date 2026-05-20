import prisma from '../../../config/database.js';

class CompanyRepository {
    async findAllOrdered() {
        return prisma.company.findMany({
            select: {
                id: true,
                name: true,
                cnpj: true,
                isActive: true
            },
            orderBy: {
                name: 'asc'
            }
        });
    }
}

export default new CompanyRepository();
