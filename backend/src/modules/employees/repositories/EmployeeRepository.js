import prisma from '../../../config/database.js';
import { criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import { CAMPOS_SELECAO_FUNCIONARIO } from '../constants/funcionarioConstantes.js';

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
                deletedAt: null,
                ...filtroConsulta
            },
            select: CAMPOS_SELECAO_FUNCIONARIO,
            orderBy: [{ name: 'asc' }]
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
     * @param {{ status?: { in: string[] } }} filtroStatus
     */
    async findManyParaExportacaoLista(filtroConsulta) {
        return prisma.employee.findMany({
            where: {
                deletedAt: null,
                ...filtroConsulta
            },
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
                deletedAt: null,
                id: { in: identificadores }
            },
            select: SELECAO_EXPORTACAO_FICHA_FUNCIONARIO,
            orderBy: [{ name: 'asc' }]
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
