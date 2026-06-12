import {
    MENSAGEM_CPF_DIGITOS_VERIFICADORES_INVALIDOS,
    MENSAGEM_CPF_FORMATO_INVALIDO
} from '../constants/funcionarioConstantes.js';
import { lancarErroFuncionario } from './lancarErroFuncionario.js';

const PADRAO_CPF_FORMATADO = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

/**
 * @param {string} cpf
 * @returns {string}
 */
export function extrairDigitosCpf(cpf) {
    return String(cpf).replace(/\D/g, '');
}

/**
 * @param {string} digitos
 * @returns {boolean}
 */
function possuiDigitosVerificadoresValidos(digitos) {
    if (/^(\d)\1{10}$/.test(digitos)) {
        return false;
    }

    let soma = 0;
    for (let indice = 0; indice < 9; indice += 1) {
        soma += Number(digitos[indice]) * (10 - indice);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10) {
        resto = 0;
    }
    if (resto !== Number(digitos[9])) {
        return false;
    }

    soma = 0;
    for (let indice = 0; indice < 10; indice += 1) {
        soma += Number(digitos[indice]) * (11 - indice);
    }
    resto = (soma * 10) % 11;
    if (resto === 10) {
        resto = 0;
    }

    return resto === Number(digitos[10]);
}

/**
 * @param {unknown} cpf
 * @returns {string}
 */
export function validarCpf(cpf) {
    const cpfInformado = String(cpf).trim();

    if (!PADRAO_CPF_FORMATADO.test(cpfInformado)) {
        lancarErroFuncionario(MENSAGEM_CPF_FORMATO_INVALIDO);
    }

    const digitos = extrairDigitosCpf(cpfInformado);
    if (digitos.length !== 11 || !possuiDigitosVerificadoresValidos(digitos)) {
        lancarErroFuncionario(MENSAGEM_CPF_DIGITOS_VERIFICADORES_INVALIDOS);
    }

    return cpfInformado;
}
