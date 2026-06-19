import {
    CLIENT_ID_PADRAO_PONTO_WEB,
    TIMEOUT_REQUISICAO_MS_PADRAO,
    URL_PADRAO_API_INTEGRACAO_SECULLUM,
    URL_PADRAO_AUTENTICADOR_SECULLUM
} from '../constants/secullumProviderConstantes.js';

/**
 * @returns {{
 *   urlAutenticador: string,
 *   urlApiIntegracao: string,
 *   clientId: number,
 *   usuario: string|null,
 *   senha: string|null,
 *   bancoId: string|null,
 *   timeoutMs: number
 * }}
 */
export function obterConfiguracaoSecullum() {
    const timeoutInformado = Number(process.env.SECULLUM_TIMEOUT_MS);

    return {
        urlAutenticador: process.env.SECULLUM_AUTH_URL || URL_PADRAO_AUTENTICADOR_SECULLUM,
        urlApiIntegracao: process.env.SECULLUM_API_URL || URL_PADRAO_API_INTEGRACAO_SECULLUM,
        clientId: Number(process.env.SECULLUM_CLIENT_ID) || CLIENT_ID_PADRAO_PONTO_WEB,
        usuario: process.env.SECULLUM_USUARIO?.trim() || null,
        senha: process.env.SECULLUM_SENHA || null,
        bancoId: process.env.SECULLUM_BANCO_ID?.trim() || null,
        timeoutMs: Number.isFinite(timeoutInformado) && timeoutInformado > 0
            ? timeoutInformado
            : TIMEOUT_REQUISICAO_MS_PADRAO
    };
}
