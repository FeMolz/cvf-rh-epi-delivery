import { baixarArquivoApi, requisicaoApi } from '../../../shared/api/clienteHttp.js';

/**
 * @param {string} token
 * @param {{ filtro?: string }} [opcoes]
 */
export function listarFuncionarios(token, opcoes = {}) {
    const parametros = new URLSearchParams();

    if (opcoes.filtro) {
        parametros.set('filtro', opcoes.filtro);
    }

    const consulta = parametros.toString();
    const caminho = consulta ? `/employees?${consulta}` : '/employees';

    return requisicaoApi(caminho, { token });
}

/**
 * @param {Record<string, unknown>} dados
 * @param {string} token
 */
export function criarFuncionario(dados, token) {
    return requisicaoApi('/employees', {
        method: 'POST',
        body: dados,
        token
    });
}

/**
 * @param {string} id
 * @param {string} token
 */
export function buscarFuncionarioPorId(id, token) {
    return requisicaoApi(`/employees/${id}`, { token });
}

/**
 * @param {string} id
 * @param {Record<string, unknown>} dados
 * @param {string} token
 */
export function atualizarFuncionario(id, dados, token) {
    return requisicaoApi(`/employees/${id}`, {
        method: 'PUT',
        body: dados,
        token
    });
}

/**
 * @param {string} token
 * @param {{ filtro?: string, companyId?: string, ids?: string[] }} [opcoes]
 */
export function baixarRelatorioFuncionarios(token, opcoes = {}) {
    const parametros = new URLSearchParams();

    if (opcoes.ids?.length) {
        parametros.set('ids', opcoes.ids.join(','));
    } else {
        if (opcoes.filtro) {
            parametros.set('filtro', opcoes.filtro);
        }

        if (opcoes.companyId) {
            parametros.set('companyId', opcoes.companyId);
        }
    }

    const consulta = parametros.toString();
    const caminho = consulta
        ? `/employees/export/lista?${consulta}`
        : '/employees/export/lista';

    return baixarArquivoApi(caminho, {
        token,
        nomeArquivoPadrao: opcoes.ids?.length === 1 ? 'funcionario.xlsx' : 'funcionarios.xlsx'
    });
}

/**
 * @param {string} id
 * @param {string} token
 */
export function baixarFichaFuncionario(id, token) {
    return baixarArquivoApi(`/employees/${id}/export`, {
        token,
        nomeArquivoPadrao: 'funcionario.xlsx'
    });
}
