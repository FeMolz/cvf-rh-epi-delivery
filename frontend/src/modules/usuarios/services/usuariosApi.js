import { requisicaoApi } from '../../../shared/api/clienteHttp.js';

/**
 * @param {{ email: string, password: string }} credenciais
 */
export function autenticarUsuario(credenciais) {
    return requisicaoApi('/users/login', {
        method: 'POST',
        body: credenciais
    });
}

/**
 * @param {string} token
 */
export function encerrarSessao(token) {
    return requisicaoApi('/users/logout', {
        method: 'POST',
        token
    });
}

/**
 * @param {{ name: string, email: string, password: string, role: string }} dados
 * @param {string} token
 */
export function cadastrarUsuario(dados, token) {
    return requisicaoApi('/users', {
        method: 'POST',
        body: dados,
        token
    });
}

/**
 * @param {string} token
 */
export function listarUsuarios(token) {
    return requisicaoApi('/users', { token });
}

/**
 * @param {string} id
 * @param {string} token
 */
export function buscarUsuarioPorId(id, token) {
    return requisicaoApi(`/users/${id}`, { token });
}

/**
 * @param {string} id
 * @param {{ name?: string, email?: string, role?: string }} dados
 * @param {string} token
 */
export function atualizarUsuario(id, dados, token) {
    return requisicaoApi(`/users/${id}`, {
        method: 'PUT',
        body: dados,
        token
    });
}

/**
 * @param {string} id
 * @param {{ password: string }} dados
 * @param {string} token
 */
export function alterarSenhaUsuario(id, dados, token) {
    return requisicaoApi(`/users/password/${id}`, {
        method: 'PUT',
        body: dados,
        token
    });
}

/**
 * @param {string} id
 * @param {string} token
 */
export function excluirUsuario(id, token) {
    return requisicaoApi(`/users/${id}`, {
        method: 'DELETE',
        token
    });
}
