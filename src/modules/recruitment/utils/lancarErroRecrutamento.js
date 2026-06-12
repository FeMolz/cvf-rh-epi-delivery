import { criarErroHttp, criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import {
    MENSAGENS_RECRUTAMENTO_400,
    MENSAGENS_RECRUTAMENTO_404
} from '../constants/recrutamentoErrosHttp.js';

/**
 * @param {string} mensagem
 * @returns {never}
 */
export function lancarErroRecrutamento(mensagem) {
    if (MENSAGENS_RECRUTAMENTO_404.has(mensagem)) {
        throw criarErroNaoEncontrado(mensagem);
    }

    if (MENSAGENS_RECRUTAMENTO_400.has(mensagem)) {
        throw criarErroHttp(mensagem, 400);
    }

    throw criarErroHttp(mensagem, 400);
}
