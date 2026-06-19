import { MENSAGEM_ROLE_ID_QUESITO_IDS_OBRIGATORIOS } from '../../../quesitos/constants/quesitoConstantes.js';

/**
 * @param {Record<string, unknown>} entrada
 * @returns {{ roleId: string, quesitoIds: string[], envioUnico: boolean }}
 */
export function normalizarEntradaVinculoQuesitoCargo(entrada) {
    const roleId = typeof entrada?.roleId === 'string' ? entrada.roleId.trim() : '';

    if (!roleId) {
        throw new Error(MENSAGEM_ROLE_ID_QUESITO_IDS_OBRIGATORIOS);
    }

    const possuiArray =
        Array.isArray(entrada?.quesitoIds) && entrada.quesitoIds.length > 0;
    const possuiUnico =
        typeof entrada?.quesitoId === 'string' && entrada.quesitoId.trim() !== '';

    const quesitoIdsColetados = [];

    if (possuiArray) {
        for (const identificador of entrada.quesitoIds) {
            if (typeof identificador === 'string' && identificador.trim() !== '') {
                quesitoIdsColetados.push(identificador.trim());
            }
        }
    }

    if (possuiUnico) {
        quesitoIdsColetados.push(entrada.quesitoId.trim());
    }

    const quesitoIds = [...new Set(quesitoIdsColetados)];

    if (quesitoIds.length === 0) {
        throw new Error(MENSAGEM_ROLE_ID_QUESITO_IDS_OBRIGATORIOS);
    }

    return {
        roleId,
        quesitoIds,
        envioUnico: possuiUnico && !possuiArray
    };
}
