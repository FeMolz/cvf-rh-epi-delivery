import prisma from '../../../config/database.js';

class SetorRepository {
    async findAllOrdered() {
        return prisma.setor.findMany({
            select: {
                id: true,
                nome: true,
                isActive: true
            },
            orderBy: {
                nome: 'asc'
            }
        });
    }
}

export default new SetorRepository();
