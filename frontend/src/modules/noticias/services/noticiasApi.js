import { requisicaoApi } from '../../../shared/api/clienteHttp.js';

/**
 * @param {string} token
 */
export function listarAniversariantesNoticias(token) {
    return requisicaoApi('/noticias/aniversariantes', { token });
}

/**
 * @param {string} token
 */
export function listarAfastamentosNoticias(token) {
    return requisicaoApi('/noticias/afastamentos', { token });
}
