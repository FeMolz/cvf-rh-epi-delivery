import { requisicaoApi } from '../../../shared/api/clienteHttp.js';

/**
 * @param {string} token
 */
export function listarAniversariantesNoticias(token) {
    return requisicaoApi('/noticias/aniversariantes', { token });
}
