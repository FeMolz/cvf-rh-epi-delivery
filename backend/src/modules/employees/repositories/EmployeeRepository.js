import prisma from '../../../config/database.js';
import { criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import { CAMPOS_SELECAO_FUNCIONARIO } from '../constants/funcionarioConstantes.js';
import { STATUS_FUNCIONARIO_AFASTAMENTO_TEMPORARIO } from '../constants/funcionarioStatusConstantes.js';

const SELECAO_EXPORTACAO_LISTA_FUNCIONARIOS = {
    name: true,
    status: true,
    resignationDate: true,
    role: { select: { name: true } },
    setor: { select: { nome: true } }
};

const SELECAO_EXPORTACAO_FICHA_FUNCIONARIO = {
    ...CAMPOS_SELECAO_FUNCIONARIO,
    deletedAt: true,
    role: { select: { id: true, name: true } }
};

class EmployeeRepository {
    async create(data) {
        return prisma.employee.create({
            data,
            select: CAMPOS_SELECAO_FUNCIONARIO
        });
    }

    /**
     * @param {{ status?: string | { in: string[] } }} filtroConsulta
     */
    async findManyComFiltro(filtroConsulta = {}) {
        return prisma.employee.findMany({
            where: {
                ...filtroConsulta
            },
            select: CAMPOS_SELECAO_FUNCIONARIO,
            orderBy: [{ name: 'asc' }]
        });
    }

    /**
     * @param {Record<string, unknown>} where
     * @param {{ admissionDate: 'asc' | 'desc' }} orderBy
     */
    async findManyConsulta(where, orderBy) {
        return prisma.employee.findMany({
            where,
            select: CAMPOS_SELECAO_FUNCIONARIO,
            orderBy: [orderBy, { name: 'asc' }]
        });
    }

    /**
     * @param {Record<string, unknown>} where
     */
    async findManyFerias(where) {
        return prisma.employee.findMany({
            where,
            select: CAMPOS_SELECAO_FUNCIONARIO,
            orderBy: [{ leaveReturnDate: 'asc' }]
        });
    }

    async findAll() {
        return this.findManyComFiltro();
    }

    async findById(id) {
        return prisma.employee.findUnique({
            where: { id },
            select: {
                ...CAMPOS_SELECAO_FUNCIONARIO,
                deletedAt: true
            }
        });
    }

    async update(id, data) {
        return prisma.employee.update({
            where: { id },
            data,
            select: CAMPOS_SELECAO_FUNCIONARIO
        });
    }

    /**
     * @param {Record<string, unknown>} filtroConsulta
     * @param {{ incluirDesligados?: boolean }} [opcoes]
     */
    async findManyParaExportacaoLista(filtroConsulta, opcoes = {}) {
        const where = { ...filtroConsulta };

        if (!opcoes.incluirDesligados) {
            where.deletedAt = null;
        }

        return prisma.employee.findMany({
            where,
            select: SELECAO_EXPORTACAO_LISTA_FUNCIONARIOS,
            orderBy: [{ name: 'asc' }]
        });
    }

    async findByIdParaExportacaoFicha(identificadorFuncionario) {
        return prisma.employee.findUnique({
            where: { id: identificadorFuncionario },
            select: SELECAO_EXPORTACAO_FICHA_FUNCIONARIO
        });
    }

    /**
     * @param {string[]} identificadores
     */
    async findManyParaExportacaoFicha(identificadores) {
        return prisma.employee.findMany({
            where: {
                id: { in: identificadores }
            },
            select: SELECAO_EXPORTACAO_FICHA_FUNCIONARIO,
            orderBy: [{ name: 'asc' }]
        });
    }

    /**
     * @param {Date} dataReferencia início do dia de referência
     */
    async findManyComAfastamentoTemporarioExpirado(dataReferencia) {
        return prisma.employee.findMany({
            where: {
                deletedAt: null,
                status: { in: STATUS_FUNCIONARIO_AFASTAMENTO_TEMPORARIO },
                leaveReturnDate: {
                    not: null,
                    lte: dataReferencia
                }
            },
            select: {
                id: true,
                status: true
            }
        });
    }

    async delete(id) {
        const existing = await this.findById(id);
        if (!existing || existing.deletedAt) {
            throw criarErroNaoEncontrado('Funcionário não encontrado');
        }
        return prisma.employee.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: 'DESLIGADO'
            }
        });
    }
}

export default new EmployeeRepository();
