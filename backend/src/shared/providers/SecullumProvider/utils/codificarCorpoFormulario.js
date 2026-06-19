/**
 * @param {Record<string, unknown>} campos
 * @returns {string}
 */
export function codificarCorpoFormulario(campos) {
    const pares = Object.entries(campos).map(([chave, valor]) => {
        const valorCodificado = valor === null || valor === undefined ? '' : String(valor);
        return `${chave}=${encodeURIComponent(valorCodificado)}`;
    });

    return pares.join('&');
}
