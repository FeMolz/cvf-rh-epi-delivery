import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';
import { MENSAGEM_DATA_ENTREGA_FUTURA, MENSAGEM_DATA_ENTREGA_INVALIDA } from '../constants/entregaEpiConstantes.js';

/**
 * @param {string | Date | undefined | null} valor
 * @returns {Date}
 */
export function resolverDataEntrega(valor) {
    if (!valor) {
        return new Date();
    }

    if (valor instanceof Date) {
        if (Number.isNaN(valor.getTime())) {
            throw criarErroHttp(MENSAGEM_DATA_ENTREGA_INVALIDA);
        }

        return valor;
    }

    const texto = String(valor).trim();

    const correspondenciaIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (correspondenciaIso) {
        const [, ano, mes, dia] = correspondenciaIso;
        const data = new Date(Date.UTC(Number(ano), Number(mes) - 1, Number(dia), 12, 0, 0, 0));

        if (Number.isNaN(data.getTime())) {
            throw criarErroHttp(MENSAGEM_DATA_ENTREGA_INVALIDA);
        }

        return data;
    }

    const data = new Date(texto);

    if (Number.isNaN(data.getTime())) {
        throw criarErroHttp(MENSAGEM_DATA_ENTREGA_INVALIDA);
    }

    return data;
}

/**
 * @param {Date} dataEntrega
 */
export function validarDataEntregaNaoFutura(dataEntrega) {
    const fimDoDiaAtual = new Date();
    fimDoDiaAtual.setHours(23, 59, 59, 999);

    if (dataEntrega.getTime() > fimDoDiaAtual.getTime()) {
        throw criarErroHttp(MENSAGEM_DATA_ENTREGA_FUTURA);
    }
}
