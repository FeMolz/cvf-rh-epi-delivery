/**
 * @param {unknown} pis
 * @returns {string|null}
 */
export function extrairDigitosPis(pis) {
    if (pis === null || pis === undefined) {
        return null;
    }

    const digitos = String(pis).replace(/\D/g, '');
    return digitos === '' ? null : digitos;
}
