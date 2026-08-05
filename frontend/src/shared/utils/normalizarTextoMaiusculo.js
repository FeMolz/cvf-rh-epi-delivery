/**
 * Normaliza texto livre para UPPERCASE no salvamento.
 * Não altera valores vazios; preserva trim e espaços internos colapsados.
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
