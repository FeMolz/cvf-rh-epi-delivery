import {
    MENSAGEM_ERRO_FORMATO_DATA,
    MENSAGEM_ERRO_PERIODO_INVALIDO
} from '../constants/relatorioEntregaEpiConstantes.js';

const PADRAO_DATA_APENAS_DIA = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * @param {string} textoData
 * @returns {Date}
 */
function montarInicioDiaUtc(textoData) {
    const correspondencia = PADRAO_DATA_APENAS_DIA.exec(textoData.trim());
    if (!correspondencia) {
        throw new Error(MENSAGEM_ERRO_FORMATO_DATA);
    }
    const ano = Number(correspondencia[1]);
    const mesIndiceZero = Number(correspondencia[2]) - 1;
    const dia = Number(correspondencia[3]);
    return new Date(Date.UTC(ano, mesIndiceZero, dia, 0, 0, 0, 0));
}

/**
 * @param {string} textoData
 * @returns {Date}
 */
function montarFimDiaUtc(textoData) {
    const correspondencia = PADRAO_DATA_APENAS_DIA.exec(textoData.trim());
    if (!correspondencia) {
        throw new Error(MENSAGEM_ERRO_FORMATO_DATA);
    }
    const ano = Number(correspondencia[1]);
    const mesIndiceZero = Number(correspondencia[2]) - 1;
    const dia = Number(correspondencia[3]);
    return new Date(Date.UTC(ano, mesIndiceZero, dia, 23, 59, 59, 999));
}

/**
 * @param {string} periodoInicioTexto
 * @param {string} periodoFimTexto
 * @returns {{ limiteInicialEntrega: Date, limiteFinalEntrega: Date }}
 */
export function construirIntervaloEntregaUtc(periodoInicioTexto, periodoFimTexto) {
    if (typeof periodoInicioTexto !== 'string' || typeof periodoFimTexto !== 'string') {
        throw new Error(MENSAGEM_ERRO_FORMATO_DATA);
    }

    const limiteInicialEntrega = montarInicioDiaUtc(periodoInicioTexto);
    const limiteFinalEntrega = montarFimDiaUtc(periodoFimTexto);

    if (limiteInicialEntrega.getTime() > limiteFinalEntrega.getTime()) {
        throw new Error(MENSAGEM_ERRO_PERIODO_INVALIDO);
    }

    return { limiteInicialEntrega, limiteFinalEntrega };
}

/**
 * @param {Date} limiteInicialEntrega
 * @param {Date} limiteFinalEntrega
 * @returns {string}
 */
export function formatarPeriodoParaPdf(limiteInicialEntrega, limiteFinalEntrega) {
    const formatador = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeZone: 'UTC' });
    return `${formatador.format(limiteInicialEntrega)} a ${formatador.format(limiteFinalEntrega)}`;
}
