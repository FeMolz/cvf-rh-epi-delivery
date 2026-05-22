import prisma from '../../../config/database.js';

const SELECAO_VINCULOS_BLOQUEADOS = {
    role: { select: { id: true, name: true, description: true } },
    company: { select: { id: true, name: true, cnpj: true } },
    setor: { select: { id: true, nome: true } }
};

const SELECAO_CADASTRO_COMPLETO = {
    id: true,
    candidaturaId: true,
    tokenAcesso: true,
    roleId: true,
    companyId: true,
    setorId: true,
    status: true,
    name: true,
    cpf: true,
    email: true,
    telefone: true,
    birthDate: true,
    admissionDate: true,
    nacionalidade: true,
    estadoCivil: true,
    racaCor: true,
    filiacao: true,
    grauInstrucao: true,
    numeroCtps: true,
    serieCtps: true,
    numeroDependentes: true,
    pis: true,
    chavePix: true,
    cep: true,
    logradouro: true,
    numeroEndereco: true,
    complemento: true,
    bairro: true,
    cidade: true,
    estado: true,
    valeTransporte: true,
    valeAlimentacao: true,
    planoSaude: true,
    employeeId: true,
    analisadoPorUserId: true,
    analisadoEm: true,
    enviadoEm: true,
    createdAt: true,
    updatedAt: true,
    ...SELECAO_VINCULOS_BLOQUEADOS,
    candidatura: {
        select: {
            id: true,
            nomeCompleto: true,
            email: true,
            telefone: true,
            anuncioVaga: { select: { id: true, tituloVaga: true } }
        }
    },
    employee: {
        select: { id: true, name: true, status: true }
    },
    analisadoPor: {
        select: { id: true, name: true, email: true }
    }
};

class CadastroContratacaoRepository {
    /**
     * @param {object} dadosCadastro
     */
    async create(dadosCadastro) {
        return prisma.cadastroContratacao.create({
            data: dadosCadastro,
            select: SELECAO_CADASTRO_COMPLETO
        });
    }

    /**
     * @param {string} identificadorCadastro
     */
    async findById(identificadorCadastro) {
        return prisma.cadastroContratacao.findUnique({
            where: { id: identificadorCadastro },
            select: SELECAO_CADASTRO_COMPLETO
        });
    }

    /**
     * @param {string} tokenAcesso
     */
    async findByToken(tokenAcesso) {
        return prisma.cadastroContratacao.findUnique({
            where: { tokenAcesso },
            select: SELECAO_CADASTRO_COMPLETO
        });
    }

    /**
     * @param {string} identificadorCandidatura
     */
    async findByCandidaturaId(identificadorCandidatura) {
        return prisma.cadastroContratacao.findUnique({
            where: { candidaturaId: identificadorCandidatura },
            select: SELECAO_CADASTRO_COMPLETO
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

        return prisma.cadastroContratacao.findMany({
            where: condicao,
            select: SELECAO_CADASTRO_COMPLETO,
            orderBy: { enviadoEm: 'desc' }
        });
    }

    /**
     * @param {string} identificadorCadastro
     * @param {object} dadosAtualizacao
     */
    async update(identificadorCadastro, dadosAtualizacao) {
        return prisma.cadastroContratacao.update({
            where: { id: identificadorCadastro },
            data: dadosAtualizacao,
            select: SELECAO_CADASTRO_COMPLETO
        });
    }

    /**
     * @param {string} identificadorCadastro
     */
    async delete(identificadorCadastro) {
        return prisma.cadastroContratacao.delete({
            where: { id: identificadorCadastro }
        });
    }
}

export default new CadastroContratacaoRepository();
