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
    const primeiroDigito = resto === 10 ? 0 : resto;

    soma = 0;

    for (let indice = 0; indice < 9; indice += 1) {
        soma += Number(noveDigitos[indice]) * (11 - indice);
    }

    soma += primeiroDigito * 2;
    resto = (soma * 10) % 11;
    const segundoDigito = resto === 10 ? 0 : resto;

    return `${primeiroDigito}${segundoDigito}`;
}

/**
 * @param {string} texto
 * @returns {number}
 */
function indiceDeterministicoDoTexto(texto) {
    let hash = 0;

    for (let indice = 0; indice < texto.length; indice += 1) {
        hash = (hash * 31 + texto.charCodeAt(indice)) >>> 0;
    }

    return (hash % 900_000) + 100_000;
}

/**
 * Gera CPF válido e único por sufixo textual (ex.: "123-ativo" ≠ "123-ferias").
 * @param {string} sufixo
 * @returns {string}
 */
export function gerarCpfIntegracao(sufixo) {
    const indice = indiceDeterministicoDoTexto(String(sufixo));
    const noveDigitos = String(indice).padStart(9, '0').slice(0, 9);
    const digitosVerificadores = calcularDigitosVerificadoresCpf(noveDigitos);
    const digitos = `${noveDigitos}${digitosVerificadores}`;

    return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9, 11)}`;
}
