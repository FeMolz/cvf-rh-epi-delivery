import prisma from '../../../config/database.js';

const SELECAO_CANDIDATURA_LISTAGEM = {
    id: true,
    anuncioVagaId: true,
    nomeCompleto: true,
    email: true,
    telefone: true,
    cpf: true,
    cidade: true,
    estado: true,
    linkedinUrl: true,
    pretensaoSalarial: true,
    disponibilidadeInicio: true,
    mensagemCandidato: true,
    curriculoNomeArquivo: true,
    curriculoTipoMime: true,
    curriculoTamanhoBytes: true,
    createdAt: true,
    anuncioVaga: {
        select: {
            id: true,
            tituloVaga: true,
            status: true,
            roleId: true,
            companyId: true,
            setorId: true
        }
    }
};

class CandidaturaRepository {
    /**
     * @param {object} dadosCandidatura
     */
    async create(dadosCandidatura) {
        return prisma.candidatura.create({
            data: dadosCandidatura,
            select: SELECAO_CANDIDATURA_LISTAGEM
        });
    }

    /**
     * @param {string} identificadorCandidatura
     */
    async findById(identificadorCandidatura) {
        return prisma.candidatura.findUnique({
            where: { id: identificadorCandidatura },
            select: SELECAO_CANDIDATURA_LISTAGEM
        });
    }

    /**
     * @param {string} identificadorCandidatura
     */
    async findByIdComCurriculo(identificadorCandidatura) {
        return prisma.candidatura.findUnique({
            where: { id: identificadorCandidatura }
        });
    }

    /**
     * @param {string} identificadorAnuncio
     * @param {{ dataInicio?: Date, dataFim?: Date }} periodo
     */
    async findManyByAnuncio(identificadorAnuncio, periodo = {}) {
        const condicaoWhere = { anuncioVagaId: identificadorAnuncio };

        if (periodo.dataInicio || periodo.dataFim) {
            condicaoWhere.createdAt = {};
            if (periodo.dataInicio) {
                condicaoWhere.createdAt.gte = periodo.dataInicio;
            }
            if (periodo.dataFim) {
                condicaoWhere.createdAt.lte = periodo.dataFim;
            }
        }

        return prisma.candidatura.findMany({
            where: condicaoWhere,
            select: SELECAO_CANDIDATURA_LISTAGEM,
            orderBy: { createdAt: 'asc' }
        });
    }

    /**
     * @param {string} identificadorAnuncio
     */
    async countByAnuncio(identificadorAnuncio) {
        return prisma.candidatura.count({
            where: { anuncioVagaId: identificadorAnuncio }
        });
    }
}

export default new CandidaturaRepository();
