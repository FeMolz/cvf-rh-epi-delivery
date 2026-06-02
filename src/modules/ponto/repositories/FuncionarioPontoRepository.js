import prisma from '../../../config/database.js';
import { SELECAO_FUNCIONARIO_RESUMO_PONTO, STATUS_FUNCIONARIO_ATIVO } from '../constants/pontoConstantes.js';

class FuncionarioPontoRepository {
    /**
     * @param {{ companyId?: string, setorId?: string, roleId?: string }} filtros
     */
    async listarAtivos(filtros = {}) {
        const condicao = {
            deletedAt: null,
            status: STATUS_FUNCIONARIO_ATIVO
        };

        if (filtros.companyId) {
            condicao.companyId = filtros.companyId;
        }

        if (filtros.setorId) {
            condicao.setorId = filtros.setorId;
        }

        if (filtros.roleId) {
            condicao.roleId = filtros.roleId;
        }

        return prisma.employee.findMany({
            where: condicao,
            select: SELECAO_FUNCIONARIO_RESUMO_PONTO,
            orderBy: [{ name: 'asc' }]
        });
    }
}

export default new FuncionarioPontoRepository();
