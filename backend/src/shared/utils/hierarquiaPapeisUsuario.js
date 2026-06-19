import {
    PAPEL_ADMIN,
    PAPEL_ADMINISTRATIVO,
    PAPEL_ALMOXARIFADO,
    PAPEL_COLABORADOR
} from '../constants/papeisUsuarioConstantes.js';

/** Índice menor = maior privilégio (ADMIN no topo). */
export const ORDEM_HIERARQUIA_PAPEIS = [
    PAPEL_ADMIN,
    PAPEL_ADMINISTRATIVO,
    PAPEL_ALMOXARIFADO,
    PAPEL_COLABORADOR
];

/**
 * @param {string | undefined} papel
 * @returns {number | null}
 */
export function obterIndiceHierarquiaPapel(papel) {
    if (!papel) {
        return null;
    }

    const indice = ORDEM_HIERARQUIA_PAPEIS.indexOf(papel);

    return indice === -1 ? null : indice;
}

/**
 * Indica se o solicitante pode atribuir o papel alvo (próprio nível ou inferior).
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
