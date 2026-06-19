import { requisicaoApi } from '../../../shared/api/clienteHttp.js';

/**
 * @param {string} token
 */
export function listarSetores(token) {
    return requisicaoApi('/setores', { token });
}
