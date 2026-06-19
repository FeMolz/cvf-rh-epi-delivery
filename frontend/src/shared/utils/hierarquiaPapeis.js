import { TODOS_OS_PAPEIS } from '../constants/papeis.js';

/**
 * @param {string | undefined} papel
 * @returns {number | null}
 */
export function obterIndiceHierarquiaPapel(papel) {
    if (!papel) {
        return null;
    }

    const indice = TODOS_OS_PAPEIS.indexOf(papel);

    return indice === -1 ? null : indice;
}

/**
 * @param {string | undefined} papelSolicitante
 * @param {string} papelAlvo
 */
export function podeAtribuirPapelUsuario(papelSolicitante, papelAlvo) {
    const indiceSolicitante = obterIndiceHierarquiaPapel(papelSolicitante);
    const indiceAlvo = obterIndiceHierarquiaPapel(papelAlvo);

    if (indiceSolicitante === null || indiceAlvo === null) {
        return false;
    }

    return indiceAlvo >= indiceSolicitante;
}

/**
 * @param {string | undefined} papelSolicitante
 * @returns {string[]}
 */
export function listarPapeisAtribuiveis(papelSolicitante) {
    return TODOS_OS_PAPEIS.filter((papel) => podeAtribuirPapelUsuario(papelSolicitante, papel));
}
