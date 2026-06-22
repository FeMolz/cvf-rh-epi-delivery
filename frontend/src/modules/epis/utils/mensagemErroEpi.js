export {
    DURACAO_MENSAGEM_FEEDBACK_MS as DURACAO_MENSAGEM_ERRO_EPI_MS,
    useMensagemTemporaria
} from '../../../shared/hooks/useMensagemTemporaria.js';

export const MENSAGEM_EPI_CA_NAO_ENCONTRADO =
    'EPI com este CA não encontrado na base pública.';

/**
 * @param {string} mensagem
 */
export function erroEpiDeveSerTemporario(mensagem) {
    return mensagem === MENSAGEM_EPI_CA_NAO_ENCONTRADO;
}
