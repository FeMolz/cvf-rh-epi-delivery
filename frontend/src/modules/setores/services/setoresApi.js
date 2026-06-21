import { requisicaoApi } from '../../../shared/api/clienteHttp.js';

/**
 * @param {string} token
 */
export function listarSetores(token) {
    return requisicaoApi('/setores', { token });
}

/**
 * @param {string} id
 * @param {string} token
 */
export function buscarSetorPorId(id, token) {
    return requisicaoApi(`/setores/${id}`, { token });
}

/**
 * @param {{ nome: string, isActive?: boolean }} dados
 * @param {string} token
 */
export function criarSetor(dados, token) {
    return requisicaoApi('/setores', {
        method: 'POST',
        body: dados,
        token
    });
}

/**
 * @param {string} id
 * @param {{ nome?: string, isActive?: boolean }} dados
 * @param {string} token
 */
export function atualizarSetor(id, dados, token) {
    return requisicaoApi(`/setores/${id}`, {
        method: 'PUT',
        body: dados,
        token
    });
}

/**
 * @param {string} id
 * @param {string} token
 */
export function excluirSetor(id, token) {
    return requisicaoApi(`/setores/${id}`, {
        method: 'DELETE',
        token
    });
}
