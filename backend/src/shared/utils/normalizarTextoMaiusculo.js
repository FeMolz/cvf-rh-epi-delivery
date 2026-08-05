/**
 * Normaliza texto livre para UPPERCASE no salvamento.
 *
 * @param {unknown} valor
 * @returns {string}
 */
export function normalizarTextoMaiusculo(valor) {
    if (valor === undefined || valor === null) {
        return '';
    }

    return String(valor)
        .trim()
        .replace(/\s+/g, ' ')
        .toUpperCase();
}
