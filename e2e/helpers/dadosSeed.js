export {
    ID_CARGO_ANALISTA_SISTEMAS,
    ID_CARGO_PEDREIRO,
    ID_EMPRESA_MATRIZ,
    ID_EPI_CAPACETE,
    ID_EPI_LUVA,
    ID_FUNCIONARIO_ANA,
    ID_FUNCIONARIO_BRUNO,
    ID_SETOR_ADMINISTRATIVO,
    SENHA_USUARIO_SEED_PADRAO
} from '../../backend/prisma/seeders/dados/identificadoresSeedConstantes.js';

/**
 * @returns {string}
 */
export function gerarSufixoUnico() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * @param {string} [prefixo]
 * @returns {string}
 */
export function gerarEmailUnico(prefixo = 'e2e') {
    return `${prefixo}.${gerarSufixoUnico()}@test.local`;
}

/**
 * @returns {string}
 */
export function gerarCnpjUnico() {
    const base = String(Date.now()).slice(-8).padStart(8, '0');
    return `${base.slice(0, 2)}.${base.slice(2, 5)}.${base.slice(5, 8)}/0001-${String(Math.floor(Math.random() * 90) + 10)}`;
}

/**
 * @param {string} [prefixo]
 * @returns {string}
 */
export function gerarNomeUnico(prefixo = 'E2E') {
    return `${prefixo} ${gerarSufixoUnico()}`;
}

/**
 * @param {string} base
 * @returns {number}
 */
function calcularDigitoVerificadorCpf(base) {
    let soma = 0;

    for (let indice = 0; indice < base.length; indice += 1) {
        soma += Number(base[indice]) * (base.length + 1 - indice);
    }

    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
}

/**
 * @returns {string}
 */
export function gerarCpfUnico() {
    const base = String(Date.now()).slice(-9).padStart(9, '0');
    const primeiroDigito = calcularDigitoVerificadorCpf(base);
    const segundoDigito = calcularDigitoVerificadorCpf(`${base}${primeiroDigito}`);
    const cpf = `${base}${primeiroDigito}${segundoDigito}`;

    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}
