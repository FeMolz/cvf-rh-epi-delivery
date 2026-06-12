import { criarErroHttp, criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import {
    MENSAGEM_CAMPOS_OBRIGATORIOS_FUNCIONARIO,
    MENSAGEM_CPF_DIGITOS_VERIFICADORES_INVALIDOS,
    MENSAGEM_CPF_DUPLICADO,
    MENSAGEM_CPF_FORMATO_INVALIDO,
    MENSAGEM_DATA_NASCIMENTO_INVALIDA,
    MENSAGEM_EMAIL_DUPLICADO,
    MENSAGEM_EMAIL_INVALIDO,
    MENSAGEM_TELEFONE_INVALIDO
} from '../constants/funcionarioConstantes.js';
import { MENSAGEM_FILTRO_FUNCIONARIO_INVALIDO } from '../constants/funcionarioStatusConstantes.js';

const MENSAGENS_FUNCIONARIO_404 = new Set([
    'Funcionário não encontrado'
]);

const MENSAGENS_FUNCIONARIO_400 = new Set([
    MENSAGEM_CAMPOS_OBRIGATORIOS_FUNCIONARIO,
    MENSAGEM_CPF_FORMATO_INVALIDO,
    MENSAGEM_CPF_DIGITOS_VERIFICADORES_INVALIDOS,
    MENSAGEM_EMAIL_INVALIDO,
    MENSAGEM_TELEFONE_INVALIDO,
    MENSAGEM_DATA_NASCIMENTO_INVALIDA,
    MENSAGEM_CPF_DUPLICADO,
    MENSAGEM_EMAIL_DUPLICADO,
    MENSAGEM_FILTRO_FUNCIONARIO_INVALIDO
]);

/**
 * @param {string} mensagem
 * @returns {never}
 */
export function lancarErroFuncionario(mensagem) {
    if (MENSAGENS_FUNCIONARIO_404.has(mensagem)) {
        throw criarErroNaoEncontrado(mensagem);
    }

    if (MENSAGENS_FUNCIONARIO_400.has(mensagem)) {
        throw criarErroHttp(mensagem, 400);
    }

    throw criarErroHttp(mensagem, 400);
}
