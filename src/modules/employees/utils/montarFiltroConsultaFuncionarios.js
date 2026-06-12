import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';
import {
    FILTRO_LISTAGEM_FUNCIONARIOS_AFASTADOS,
    FILTRO_LISTAGEM_FUNCIONARIOS_ATIVOS,
    FILTRO_LISTAGEM_FUNCIONARIOS_FERIAS,
    FILTRO_LISTAGEM_FUNCIONARIOS_INATIVOS,
    FILTRO_LISTAGEM_FUNCIONARIOS_LICENCA_MATERNIDADE,
    FILTRO_LISTAGEM_FUNCIONARIOS_LICENCA_MED,
    FILTRO_LISTAGEM_FUNCIONARIOS_TODOS,
    FILTROS_LISTAGEM_FUNCIONARIOS,
    MENSAGEM_FILTRO_FUNCIONARIO_INVALIDO,
    STATUS_FUNCIONARIO_AFASTADOS,
    STATUS_FUNCIONARIO_EM_EXERCICIO,
    STATUS_FUNCIONARIO_INATIVOS
} from '../constants/funcionarioStatusConstantes.js';

const MAPA_FILTRO_PARA_STATUS = {
    [FILTRO_LISTAGEM_FUNCIONARIOS_ATIVOS]: { status: { in: STATUS_FUNCIONARIO_EM_EXERCICIO } },
    ativo: { status: 'ATIVO' },
    [FILTRO_LISTAGEM_FUNCIONARIOS_AFASTADOS]: { status: { in: STATUS_FUNCIONARIO_AFASTADOS } },
    [FILTRO_LISTAGEM_FUNCIONARIOS_FERIAS]: { status: 'FERIAS' },
    [FILTRO_LISTAGEM_FUNCIONARIOS_LICENCA_MATERNIDADE]: { status: 'LICENCA_MATERNIDADE' },
    [FILTRO_LISTAGEM_FUNCIONARIOS_LICENCA_MED]: { status: 'LICENCA_MED' },
    [FILTRO_LISTAGEM_FUNCIONARIOS_INATIVOS]: { status: { in: STATUS_FUNCIONARIO_INATIVOS } },
    inativo: { status: 'INATIVO' },
    desligado: { status: 'DESLIGADO' },
    rescindido: { status: 'RESCINDIDO' },
    aposentado: { status: 'APOSENTADO' },
    [FILTRO_LISTAGEM_FUNCIONARIOS_TODOS]: {}
};

/**
 * @param {string | undefined} filtroBruto
 * @returns {{ status?: string | { in: string[] } }}
 */
export function montarFiltroConsultaFuncionarios(filtroBruto) {
    const filtroNormalizado = String(filtroBruto || FILTRO_LISTAGEM_FUNCIONARIOS_ATIVOS)
        .trim()
        .toLowerCase();

    if (!FILTROS_LISTAGEM_FUNCIONARIOS.includes(filtroNormalizado)) {
        throw criarErroHttp(MENSAGEM_FILTRO_FUNCIONARIO_INVALIDO, 400);
    }

    return MAPA_FILTRO_PARA_STATUS[filtroNormalizado] ?? {};
}
