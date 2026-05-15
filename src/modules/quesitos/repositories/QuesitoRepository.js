import prisma from '../../../config/database.js';

class QuesitoRepository {
    /**
     * @param {{ nome: string, descricao: string, bloco: string }} dadosQuesito
     */
    async create(dadosQuesito) {
        return prisma.quesito.create({
            data: dadosQuesito
        });
    }

    /**
     * @param {string} nomeNormalizado
     */
    async findByNome(nomeNormalizado) {
        return prisma.quesito.findUnique({
            where: { nome: nomeNormalizado }
        });
    }

    /**
     * @param {string} blocoNormalizado
     */
    async findManyByBloco(blocoNormalizado) {
        return prisma.quesito.findMany({
            where: { bloco: blocoNormalizado },
            orderBy: [{ bloco: 'asc' }, { nome: 'asc' }]
        });
    }

    async findAllOrdered() {
        return prisma.quesito.findMany({
            orderBy: [{ bloco: 'asc' }, { nome: 'asc' }]
        });
    }

    /**
     * @param {string} identificadorQuesito
     */
    async findById(identificadorQuesito) {
        return prisma.quesito.findUnique({
            where: { id: identificadorQuesito }
        });
    }
}

export default new QuesitoRepository();
