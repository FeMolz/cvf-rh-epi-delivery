/**
 * @param {Date|string|null|undefined} data
 * @returns {string}
 */
export function formatarDataPlanilha(data) {
    if (!data) {
        return '';
    }

    const dataObjeto = data instanceof Date ? data : new Date(data);
    if (Number.isNaN(dataObjeto.getTime())) {
        return '';
    }

    const dia = String(dataObjeto.getUTCDate()).padStart(2, '0');
    const mes = String(dataObjeto.getUTCMonth() + 1).padStart(2, '0');
    const ano = dataObjeto.getUTCFullYear();

    return `${dia}/${mes}/${ano}`;
}

/**
 * @param {boolean|null|undefined} valor
 * @returns {string}
 */
export function formatarBooleanoPlanilha(valor) {
    if (valor === true) {
        return 'Sim';
    }
    if (valor === false) {
        return 'Não';
    }
    return '';
}

/**
 * @param {unknown} valor
 * @returns {string}
 */
export function formatarTextoPlanilha(valor) {
    if (valor === null || valor === undefined) {
        return '';
    }
    return String(valor);
}
