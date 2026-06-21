/**
 * @param {string} noveDigitos
 * @returns {string}
 */
function calcularDigitosVerificadoresCpf(noveDigitos) {
    let soma = 0;

    for (let indice = 0; indice < 9; indice += 1) {
        soma += Number(noveDigitos[indice]) * (10 - indice);
    }

    let resto = (soma * 10) % 11;
    let primeiroDigito = resto === 10 ? 0 : resto;

    soma = 0;

    for (let indice = 0; indice < 9; indice += 1) {
        soma += Number(noveDigitos[indice]) * (11 - indice);
    }

    soma += primeiroDigito * 2;
    resto = (soma * 10) % 11;
    let segundoDigito = resto === 10 ? 0 : resto;

    return `${primeiroDigito}${segundoDigito}`;
}

/**
 * @param {string} digitos
 * @returns {string}
 */
function formatarCpf(digitos) {
    return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9, 11)}`;
}

/**
 * Gera CPF válido e determinístico para seeds (índice >= 1).
 * @param {number} indice
 * @returns {string}
 */
export function gerarCpfValidoSeed(indice) {
    const baseNumerica = 100_000_000 + indice * 137_371;
    const noveDigitos = String(baseNumerica).padStart(9, '0').slice(0, 9);
    const digitosVerificadores = calcularDigitosVerificadoresCpf(noveDigitos);

    return formatarCpf(`${noveDigitos}${digitosVerificadores}`);
}
