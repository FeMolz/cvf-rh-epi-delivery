import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';
import {
    MENSAGEM_DATA_RETORNO_AFASTAMENTO_INVALIDA,
    MENSAGEM_DATA_RETORNO_AFASTAMENTO_OBRIGATORIA,
    MENSAGEM_DATA_RETORNO_AFASTAMENTO_PASSADA
} from '../constants/funcionarioConstantes.js';
import { STATUS_FUNCIONARIO_PERIODICIDADE_EPI_ATIVA } from '../constants/funcionarioStatusConstantes.js';
import {
    afastamentoTemporarioExpirado,
    inicioDoDia,
    statusFuncionarioExigeDataRetornoAfastamento
} from './afastamentoTemporarioFuncionario.js';
import { converterDataFuncionario } from './montarDadosFuncionario.js';

/**
 * Aplica regras de data de retorno conforme mudança de status.
 * @param {{
 *   statusAnterior: string,
 *   statusNovo: string,
 *   leaveReturnDate?: unknown,
 *   leaveReturnDateAnterior?: Date | null
 * }} parametros
 * @returns {{ leaveReturnDate?: Date | null }}
 */
export function resolverDataRetornoAfastamento({
    statusAnterior,
    statusNovo,
    leaveReturnDate,
    leaveReturnDateAnterior
}) {
    const exigeRetorno = statusFuncionarioExigeDataRetornoAfastamento(statusNovo);
    const dados = {};
    const mudouParaAfastamento =
        exigeRetorno && !statusFuncionarioExigeDataRetornoAfastamento(statusAnterior);
    const alterouDataRetorno = leaveReturnDate !== undefined;

    if (!exigeRetorno) {
        if (
            statusFuncionarioExigeDataRetornoAfastamento(statusAnterior) ||
            leaveReturnDate !== undefined
        ) {
            dados.leaveReturnDate = null;
        }

        return dados;
    }

    const dataInformada =
        leaveReturnDate !== undefined ? converterDataFuncionario(leaveReturnDate) : leaveReturnDateAnterior;

    if (!dataInformada) {
        throw criarErroHttp(MENSAGEM_DATA_RETORNO_AFASTAMENTO_OBRIGATORIA);
    }

    const retorno = inicioDoDia(dataInformada);

    if (!retorno) {
        throw criarErroHttp(MENSAGEM_DATA_RETORNO_AFASTAMENTO_INVALIDA);
    }

    if ((mudouParaAfastamento || alterouDataRetorno) && afastamentoTemporarioExpirado(retorno)) {
        throw criarErroHttp(MENSAGEM_DATA_RETORNO_AFASTAMENTO_PASSADA);
    }

    dados.leaveReturnDate = retorno;
    return dados;
}

/**
 * @param {string} _status
 * @returns {string}
 */
export function obterStatusAposExpiracaoAfastamento(_status) {
    return STATUS_FUNCIONARIO_PERIODICIDADE_EPI_ATIVA;
}
