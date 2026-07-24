import { PREFIXO_ROTA_CADASTRO_CONTRATACAO_PUBLICO } from '../constants/recrutamentoConstantes.js';

/**
 * @param {string} frontendPublicUrl
 * @param {string} tokenAcesso
 */
export function montarUrlCadastroContratacaoAbsoluta(frontendPublicUrl, tokenAcesso) {
    const base = String(frontendPublicUrl || '').replace(/\/$/, '');
    return `${base}${PREFIXO_ROTA_CADASTRO_CONTRATACAO_PUBLICO}/${tokenAcesso}`;
}
