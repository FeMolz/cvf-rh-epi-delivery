/**
 * @param {string} nome
 * @returns {string}
 */
export function formatarNomeCargo(nome) {
    return String(nome ?? '')
        .trim()
        .replace(/\s+/g, ' ')
        .toUpperCase();
}
