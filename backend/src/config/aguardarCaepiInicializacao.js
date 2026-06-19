import {
    INTERVALO_AGUARDAR_CAEPI_MS,
    MAX_TENTATIVAS_AGUARDAR_CAEPI,
    URL_PADRAO_CAEPI_API
} from '../shared/constants/caepiConstantes.js';
import { verificarDisponibilidadeCaepi } from '../shared/providers/EpiProvider/verificarDisponibilidadeCaepi.js';

/**
 * @param {number} milissegundos
 */
function aguardar(milissegundos) {
    return new Promise((resolver) => {
        setTimeout(resolver, milissegundos);
    });
}

/**
 * @param {string} urlCaepi
 * @returns {Promise<void>}
 */
export async function aguardarCaepiDisponivel(urlCaepi) {
    const urlBase = urlCaepi || process.env.CAEPI_API_URL || URL_PADRAO_CAEPI_API;

    for (let tentativa = 1; tentativa <= MAX_TENTATIVAS_AGUARDAR_CAEPI; tentativa += 1) {
        const disponivel = await verificarDisponibilidadeCaepi(urlBase);

        if (disponivel) {
            console.log(`[CAEPI] API disponível em ${urlBase}`);
            return;
        }

        console.warn(
            `[CAEPI] Aguardando API (${tentativa}/${MAX_TENTATIVAS_AGUARDAR_CAEPI}) em ${urlBase}...`
        );
        await aguardar(INTERVALO_AGUARDAR_CAEPI_MS);
    }

    throw new Error(
        `API baseCAEPI indisponível em ${urlBase}. Execute npm run docker:apoio:up ou verifique CAEPI_API_URL.`
    );
}

/**
 * @param {{ nodeEnv: string, urlCaepi: string | null, aguardarInicio: boolean }} configuracao
 * @returns {Promise<void>}
 */
export async function aguardarCaepiSeNecessario(configuracao) {
    const { nodeEnv, urlCaepi, aguardarInicio } = configuracao;

    if (!aguardarInicio) {
        return;
    }

    const urlEfetiva = urlCaepi || (nodeEnv === 'production' ? null : URL_PADRAO_CAEPI_API);

    if (!urlEfetiva) {
        return;
    }

    await aguardarCaepiDisponivel(urlEfetiva);
}
