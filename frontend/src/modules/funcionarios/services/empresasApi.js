import { requisicaoApi } from '../../../shared/api/clienteHttp.js';

/**
 * @param {string} token
 */
export function listarEmpresas(token) {
    return requisicaoApi('/companies', { token });
}
