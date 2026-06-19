import { requisicaoApi } from '../../../shared/api/clienteHttp.js';

/**
 * @param {string} token
 * @param {{ incluirInativos?: boolean, apenasInativos?: boolean }} [opcoes]
 */
export function listarCargos(token, opcoes = {}) {
    const parametros = new URLSearchParams();

    if (opcoes.incluirInativos) {
        parametros.set('incluirInativos', 'true');
    }

    if (opcoes.apenasInativos) {
        parametros.set('apenasInativos', 'true');
    }

    const consulta = parametros.toString();
    const caminho = consulta ? `/roles?${consulta}` : '/roles';

    return requisicaoApi(caminho, { token });
}

/**
 * @param {string} id
 * @param {string} token
 */
export function buscarCargoPorId(id, token) {
    return requisicaoApi(`/roles/${id}`, { token });
}

/**
 * @param {{ name: string, description?: string }} dados
 * @param {string} token
 */
export function criarCargo(dados, token) {
    return requisicaoApi('/roles', {
        method: 'POST',
        body: dados,
        token
    });
}

/**
 * @param {string} id
 * @param {{ name?: string, description?: string }} dados
 * @param {string} token
 */
export function atualizarCargo(id, dados, token) {
    return requisicaoApi(`/roles/${id}`, {
        method: 'PUT',
        body: dados,
        token
    });
}

/**
 * @param {string} id
 * @param {string} token
 */
export function excluirCargo(id, token) {
    return requisicaoApi(`/roles/${id}`, {
        method: 'DELETE',
        token
    });
}
