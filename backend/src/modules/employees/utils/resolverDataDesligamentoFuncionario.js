import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';
import { statusFuncionarioEncerraVinculo } from '../../../shared/constants/funcionarioVinculoConstantes.js';
import {
    MENSAGEM_DATA_DESLIGAMENTO_INVALIDA,
    MENSAGEM_DATA_DESLIGAMENTO_OBRIGATORIA
} from '../constants/funcionarioConstantes.js';
import { inicioDoDia } from './afastamentoTemporarioFuncionario.js';
import { converterDataFuncionario } from './montarDadosFuncionario.js';

/**
 * Aplica regras de data de desligamento conforme mudança de status.
 * @param {{
 *   statusAnterior: string,
 *   statusNovo: string,
 *   resignationDate?: unknown,
 *   resignationDateAnterior?: Date | null
 * }} parametros
 * @returns {{ resignationDate?: Date | null }}
 */
export function resolverDataDesligamentoFuncionario({
    statusAnterior,
    statusNovo,
    resignationDate,
    resignationDateAnterior
}) {
    const exigeDesligamento = statusFuncionarioEncerraVinculo(statusNovo);
    const dados = {};

    if (!exigeDesligamento) {
        if (statusFuncionarioEncerraVinculo(statusAnterior) || resignationDate !== undefined) {
            dados.resignationDate = null;
        }

        return dados;
    }

    const dataInformada =
        resignationDate !== undefined
            ? converterDataFuncionario(resignationDate)
            : resignationDateAnterior;

    if (!dataInformada) {
        throw criarErroHttp(MENSAGEM_DATA_DESLIGAMENTO_OBRIGATORIA);
    }

    const desligamento = inicioDoDia(dataInformada);

    if (!desligamento) {
        throw criarErroHttp(MENSAGEM_DATA_DESLIGAMENTO_INVALIDA);
    }

    dados.resignationDate = desligamento;
    return dados;
}
