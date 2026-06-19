const PADRAO_DATA_REFERENCIA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * @param {unknown} dataInformada
 * @returns {string}
 */
export function formatarDataReferencia(dataInformada) {
    if (dataInformada === undefined || dataInformada === null || dataInformada === '') {
        const hoje = new Date();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        return `${hoje.getFullYear()}-${mes}-${dia}`;
    }

    const texto = String(dataInformada).trim();

    if (!PADRAO_DATA_REFERENCIA.test(texto)) {
        return '';
    }

    return texto;
}
