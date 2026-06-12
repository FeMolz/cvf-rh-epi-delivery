import {
    MENSAGEM_DATA_FIM_INVALIDA,
    MENSAGEM_DATA_INICIO_INVALIDA,
    MENSAGEM_PERIODO_FILTRO_INVALIDO
} from '../constants/recrutamentoConstantes.js';
import { lancarErroRecrutamento } from './lancarErroRecrutamento.js';

/**
 * @param {{ dataInicio?: string, dataFim?: string }} filtros
 * @returns {{ dataInicio?: Date, dataFim?: Date }}
 */
export function validarPeriodoFiltroCandidaturas(filtros) {
    const resultado = {};

    if (filtros.dataInicio) {
        const dataInicio = new Date(filtros.dataInicio);
        if (Number.isNaN(dataInicio.getTime())) {
            lancarErroRecrutamento(MENSAGEM_DATA_INICIO_INVALIDA);
        }
        resultado.dataInicio = dataInicio;
    }

    if (filtros.dataFim) {
        const dataFim = new Date(filtros.dataFim);
        if (Number.isNaN(dataFim.getTime())) {
            lancarErroRecrutamento(MENSAGEM_DATA_FIM_INVALIDA);
        }
        resultado.dataFim = dataFim;
    }

    if (resultado.dataInicio && resultado.dataFim && resultado.dataInicio > resultado.dataFim) {
        lancarErroRecrutamento(MENSAGEM_PERIODO_FILTRO_INVALIDO);
    }

    return resultado;
}
