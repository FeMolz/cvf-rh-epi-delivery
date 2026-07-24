import { STATUS_CANDIDATURA } from '../constants/recrutamentoConstantes.js';
import prisma from '../../../config/database.js';

const SELECAO_CANDIDATURA_LISTAGEM = {
    id: true,
    anuncioVagaId: true,
    userId: true,
    status: true,
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
    descricaoVisualizadaEm: true,
    curriculoVisualizadoEm: true,
    descartadoEm: true,
    reativadoEm: true,
    createdAt: true,
    updatedAt: true,
    anuncioVaga: {
        select: {
            id: true,
            tituloVaga: true,
            status: true,
            roleId: true,
            companyId: true,
            setorId: true
        }
    },
    user: {
        select: { id: true, name: true, email: true }
    }
};

const SELECAO_ANUNCIO_ATIVO = {
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
    status: true,
    createdAt: true,
    updatedAt: true,
    role: { select: { id: true, name: true } },
    company: { select: { id: true, name: true } },
    setor: { select: { id: true, nome: true } }
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
     * @param {string} identificadorUsuario
     */
    async findByAnuncioAndUser(identificadorAnuncio, identificadorUsuario) {
        return prisma.candidatura.findFirst({
            where: {
                anuncioVagaId: identificadorAnuncio,
                userId: identificadorUsuario
            },
            select: SELECAO_CANDIDATURA_LISTAGEM
        });
    }

    /**
     * Busca candidatura ativa (não descartada) pelo e-mail na vaga.
     * @param {string} identificadorAnuncio
     * @param {string} email
     */
    async findByAnuncioAndEmail(identificadorAnuncio, email) {
        return prisma.candidatura.findFirst({
            where: {
                anuncioVagaId: identificadorAnuncio,
                email,
                status: { not: STATUS_CANDIDATURA.DESCARTADO }
            },
            select: SELECAO_CANDIDATURA_LISTAGEM
        });
    }

    /**
     * @param {{ anuncioVagaId?: string, dataInicio?: Date, dataFim?: Date, status?: string, incluirDescartadas?: boolean }} filtros
     */
    montarCondicaoWhere(filtros = {}) {
        const condicaoWhere = {};

        if (filtros.reativados) {
            condicaoWhere.reativadoEm = { not: null };
            condicaoWhere.status = { not: 'DESCARTADO' };

            if (filtros.anuncioVagaId) {
                condicaoWhere.anuncioVagaId = filtros.anuncioVagaId;
            }

            if (filtros.dataInicio || filtros.dataFim) {
                condicaoWhere.createdAt = {};
                if (filtros.dataInicio) {
                    condicaoWhere.createdAt.gte = filtros.dataInicio;
                }
                if (filtros.dataFim) {
                    condicaoWhere.createdAt.lte = filtros.dataFim;
                }
            }

            if (filtros.excluirComCadastroAtivo) {
                condicaoWhere.AND = [
                    ...(condicaoWhere.AND || []),
                    { cadastroContratacao: null }
                ];
            }

            return condicaoWhere;
        }

        if (filtros.anuncioVagaId) {
            condicaoWhere.anuncioVagaId = filtros.anuncioVagaId;
        }

        if (filtros.status) {
            condicaoWhere.status = filtros.status;
        } else if (!filtros.incluirDescartadas) {
            condicaoWhere.status = { not: 'DESCARTADO' };
        }

        if (filtros.dataInicio || filtros.dataFim) {
            condicaoWhere.createdAt = {};
            if (filtros.dataInicio) {
                condicaoWhere.createdAt.gte = filtros.dataInicio;
            }
            if (filtros.dataFim) {
                condicaoWhere.createdAt.lte = filtros.dataFim;
            }
        }

        if (filtros.excluirReativadosSemVaga) {
            condicaoWhere.AND = [
                ...(condicaoWhere.AND || []),
                { reativadoEm: null }
            ];
        }

        if (filtros.excluirComCadastroAtivo) {
            condicaoWhere.AND = [
                ...(condicaoWhere.AND || []),
                { cadastroContratacao: null }
            ];
        }

        return condicaoWhere;
    }

    /**
     * @param {{ anuncioVagaId?: string, dataInicio?: Date, dataFim?: Date, status?: string, incluirDescartadas?: boolean }} filtros
     */
    async findMany(filtros = {}) {
        const direcaoOrdenacao = filtros.ordenacao === 'ANTIGOS' ? 'asc' : 'desc';

        return prisma.candidatura.findMany({
            where: this.montarCondicaoWhere(filtros),
            select: SELECAO_CANDIDATURA_LISTAGEM,
            orderBy: { createdAt: direcaoOrdenacao }
        });
    }

    /**
     * @param {{ anuncioVagaId?: string, dataInicio?: Date, dataFim?: Date, status?: string, incluirDescartadas?: boolean }} filtros
     */
    async count(filtros = {}) {
        return prisma.candidatura.count({
            where: this.montarCondicaoWhere(filtros)
        });
    }

    /**
     * @param {string} identificadorAnuncio
     * @param {{ dataInicio?: Date, dataFim?: Date, status?: string, incluirDescartadas?: boolean }} filtros
     */
    async findManyByAnuncio(identificadorAnuncio, filtros = {}) {
        return this.findMany({ anuncioVagaId: identificadorAnuncio, ...filtros });
    }

    /**
     * @param {string} identificadorAnuncio
     * @param {{ incluirDescartadas?: boolean }} opcoes
     */
    async countByAnuncio(identificadorAnuncio, opcoes = {}) {
        return this.count({ anuncioVagaId: identificadorAnuncio, ...opcoes });
    }

    /**
     * @param {string} identificadorCandidatura
     * @param {object} dadosAtualizacao
     */
    async update(identificadorCandidatura, dadosAtualizacao) {
        return prisma.candidatura.update({
            where: { id: identificadorCandidatura },
            data: dadosAtualizacao,
            select: SELECAO_CANDIDATURA_LISTAGEM
        });
    }

    /**
     * @param {Date} dataLimite
     */
    async deleteManyDescartadasAntigas(dataLimite) {
        const resultado = await prisma.candidatura.deleteMany({
            where: {
                status: 'DESCARTADO',
                descartadoEm: { lt: dataLimite }
            }
        });

        return resultado.count;
    }
}

export { SELECAO_ANUNCIO_ATIVO };
export default new CandidaturaRepository();
