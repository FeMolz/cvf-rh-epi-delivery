/**
 * @param {unknown} valor
 * @returns {string|null}
 */
function obterTextoCampo(valor) {
    if (valor === null || valor === undefined) {
        return null;
    }

    const texto = String(valor).trim();
    return texto === '' ? null : texto;
}

/**
 * @param {Record<string, unknown>} registroBruto
 * @param {string[]} chavesPossiveis
 * @returns {string|null}
 */
function obterPrimeiroCampoTexto(registroBruto, chavesPossiveis) {
    for (const chave of chavesPossiveis) {
        const valor = obterTextoCampo(registroBruto[chave]);
        if (valor) {
            return valor;
        }
    }

    return null;
}

/**
 * @param {unknown} registroBruto
 * @returns {{
 *   funcionarioCpf: string|null,
 *   funcionarioPis: string|null,
 *   dataHora: string|null,
 *   origem: string|null,
 *   dadosBrutos: Record<string, unknown>
 * }|null}
 */
export function normalizarBatidaSecullum(registroBruto) {
    if (!registroBruto || typeof registroBruto !== 'object') {
        return null;
    }

    const registro = /** @type {Record<string, unknown>} */ (registroBruto);

    return {
        funcionarioCpf: obterPrimeiroCampoTexto(registro, [
            'funcionarioCpf',
            'FuncionarioCpf',
            'cpf',
            'Cpf'
        ]),
        funcionarioPis: obterPrimeiroCampoTexto(registro, [
            'funcionarioPis',
            'FuncionarioPis',
            'numeroPis',
            'NumeroPis',
            'pis',
            'Pis'
        ]),
        dataHora: obterPrimeiroCampoTexto(registro, [
            'dataHora',
            'DataHora',
            'data',
            'Data',
            'hora',
            'Hora'
        ]),
        origem: obterPrimeiroCampoTexto(registro, ['origem', 'Origem']),
        dadosBrutos: registro
    };
}

/**
 * @param {unknown} respostaApi
 * @returns {ReturnType<typeof normalizarBatidaSecullum>[]}
 */
export function normalizarListaBatidasSecullum(respostaApi) {
    if (!Array.isArray(respostaApi)) {
        return [];
    }

    return respostaApi
        .map(registro => normalizarBatidaSecullum(registro))
        .filter(registro => registro !== null);
}
