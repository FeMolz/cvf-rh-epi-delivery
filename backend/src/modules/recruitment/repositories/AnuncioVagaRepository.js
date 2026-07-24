import prisma from '../../../config/database.js';

const SELECAO_ANUNCIO_SEM_CURRICULO = {
    id: true,
    tituloVaga: true,
    apresentacaoEmpresa: true,
    sobreVaga: true,
    responsabilidades: true,
    requisitos: true,
    beneficios: true,
    localTrabalho: true,
    modoTrabalho: true,
    tipoContratacao: true,
    jornadaTrabalho: true,
    faixaSalarial: true,
    roleId: true,
    companyId: true,
    setorId: true,
    status: true,
    criadoPorUserId: true,
    createdAt: true,
    updatedAt: true,
    role: { select: { id: true, name: true, description: true } },
    company: { select: { id: true, name: true, cnpj: true } },
    setor: { select: { id: true, nome: true } },
    criadoPor: {
        select: { id: true, name: true, email: true }
    }
};

class AnuncioVagaRepository {
    /**
     * @param {object} dadosAnuncio
     */
    async create(dadosAnuncio) {
        return prisma.anuncioVaga.create({
            data: dadosAnuncio,
            select: SELECAO_ANUNCIO_SEM_CURRICULO
        });
    }

    /**
     * @param {string} identificadorAnuncio
     */
    async findById(identificadorAnuncio) {
        return prisma.anuncioVaga.findUnique({
            where: { id: identificadorAnuncio },
            select: SELECAO_ANUNCIO_SEM_CURRICULO
        });
    }

    /**
     * @param {{ status?: string }} filtros
     */
    async findMany(filtros = {}) {
        const condicao = {};
        if (filtros.status) {
            condicao.status = filtros.status;
        }

        return prisma.anuncioVaga.findMany({
            where: condicao,
            select: SELECAO_ANUNCIO_SEM_CURRICULO,
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * @param {string} identificadorAnuncio
     * @param {object} dadosAnuncio
     */
    async update(identificadorAnuncio, dadosAnuncio) {
        return prisma.anuncioVaga.update({
            where: { id: identificadorAnuncio },
            data: dadosAnuncio,
            select: SELECAO_ANUNCIO_SEM_CURRICULO
        });
    }
}

export default new AnuncioVagaRepository();
