/**
 * @param {string} identificadorFuncionario
 * @param {string} identificadorRelatorio
 * @returns {string}
 */
export function montarPathRelatorioEpi(identificadorFuncionario, identificadorRelatorio) {
    return `${identificadorFuncionario}/${identificadorRelatorio}.pdf`;
}
