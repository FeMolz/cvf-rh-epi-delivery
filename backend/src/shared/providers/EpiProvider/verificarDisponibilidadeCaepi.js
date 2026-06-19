import {
    NUMERO_CA_PROBE_DISPONIBILIDADE_CAEPI,
    TIMEOUT_PADRAO_VERIFICACAO_CAEPI_MS,
    URL_PADRAO_CAEPI_API
} from '../../constants/caepiConstantes.js';

/**
 * @param {string} [urlBase]
 * @param {number} [timeoutMs]
 * @returns {Promise<boolean>}
 */
export async function verificarDisponibilidadeCaepi(
    urlBase = process.env.CAEPI_API_URL || URL_PADRAO_CAEPI_API,
    timeoutMs = Number(process.env.CAEPI_API_TIMEOUT_MS) || TIMEOUT_PADRAO_VERIFICACAO_CAEPI_MS
) {
    const urlNormalizada = String(urlBase).replace(/\/$/, '');
    const controladorAborto = new AbortController();
    const temporizador = setTimeout(() => controladorAborto.abort(), timeoutMs);

    try {
        const resposta = await fetch(
            `${urlNormalizada}/CA/${NUMERO_CA_PROBE_DISPONIBILIDADE_CAEPI}`,
            { signal: controladorAborto.signal }
        );

        return resposta.ok || resposta.status === 404;
    } catch {
        return false;
    } finally {
        clearTimeout(temporizador);
    }
}
