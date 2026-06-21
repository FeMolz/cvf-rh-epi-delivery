import { requisicaoApi } from '../../../shared/api/clienteHttp.js';

/**
 * @param {string} token
 */
export function listarEmpresas(token) {
    return requisicaoApi('/companies', { token });
}

/**
 * @param {string} id
 * @param {string} token
 */
export function buscarEmpresaPorId(id, token) {
    return requisicaoApi(`/companies/${id}`, { token });
}

/**
 * @param {{ name: string, cnpj: string, isActive?: boolean }} dados
 * @param {string} token
 */
export function criarEmpresa(dados, token) {
    return requisicaoApi('/companies', {
        method: 'POST',
        body: dados,
        token
    });
}

/**
 * @param {string} id
 * @param {{ name?: string, cnpj?: string, isActive?: boolean }} dados
 * @param {string} token
 */
export function atualizarEmpresa(id, dados, token) {
    return requisicaoApi(`/companies/${id}`, {
        method: 'PUT',
        body: dados,
        token
    });
}

/**
 * @param {string} id
 * @param {string} token
 */
export function excluirEmpresa(id, token) {
    return requisicaoApi(`/companies/${id}`, {
        method: 'DELETE',
        token
    });
}
