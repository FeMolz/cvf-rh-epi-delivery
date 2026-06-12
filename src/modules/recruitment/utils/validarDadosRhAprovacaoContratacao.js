import {
    MENSAGEM_DATA_ADMISSAO_INVALIDA,
    MENSAGEM_DATA_ADMISSAO_OBRIGATORIA_RH
} from '../constants/recrutamentoConstantes.js';
import { lancarErroRecrutamento } from './lancarErroRecrutamento.js';

/**
 * @param {object} entrada
 */
export function validarDadosRhAprovacaoContratacao(entrada) {
    const dataAdmissaoBruta = entrada.admissionDate;

    if (dataAdmissaoBruta === undefined || dataAdmissaoBruta === null) {
        lancarErroRecrutamento(MENSAGEM_DATA_ADMISSAO_OBRIGATORIA_RH);
    }

    if (typeof dataAdmissaoBruta === 'string' && dataAdmissaoBruta.trim() === '') {
        lancarErroRecrutamento(MENSAGEM_DATA_ADMISSAO_OBRIGATORIA_RH);
    }

    const dataAdmissao =
        dataAdmissaoBruta instanceof Date
            ? dataAdmissaoBruta
            : new Date(typeof dataAdmissaoBruta === 'string' ? dataAdmissaoBruta.trim() : dataAdmissaoBruta);

    if (Number.isNaN(dataAdmissao.getTime())) {
        lancarErroRecrutamento(MENSAGEM_DATA_ADMISSAO_INVALIDA);
    }

    return {
        admissionDate: dataAdmissao,
        valeTransporte: entrada.valeTransporte !== undefined ? Boolean(entrada.valeTransporte) : false,
        valeAlimentacao: entrada.valeAlimentacao !== undefined ? Boolean(entrada.valeAlimentacao) : false,
        planoSaude: entrada.planoSaude !== undefined ? Boolean(entrada.planoSaude) : false
    };
}
