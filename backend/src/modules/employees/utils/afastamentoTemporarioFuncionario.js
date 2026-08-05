import { STATUS_FUNCIONARIO_AFASTAMENTO_TEMPORARIO } from '../constants/funcionarioStatusConstantes.js';

const PADRAO_DATA_SOMENTE_DIA = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * @param {unknown} valor
 * @returns {Date | null}
 */
export function parsearDataSomenteDia(valor) {
    if (valor === null || valor === undefined || valor === '') {
        return null;
    }

    if (valor instanceof Date) {
        if (Number.isNaN(valor.getTime())) {
            return null;
        }

        return new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
    }

    const texto = String(valor).trim();

    if (!texto) {
        return null;
    }

    const parteData = texto.includes('T') ? texto.slice(0, 10) : texto;
    const correspondencia = PADRAO_DATA_SOMENTE_DIA.exec(parteData);

    if (correspondencia) {
        const [, ano, mes, dia] = correspondencia;
        const data = new Date(Number(ano), Number(mes) - 1, Number(dia));

        return data;
    }

    const data = new Date(texto);

    if (Number.isNaN(data.getTime())) {
        return null;
    }

    data.setHours(0, 0, 0, 0);
    return data;
}

/**
 * @param {string} status
 * @returns {boolean}
 */
export function statusFuncionarioExigeDataRetornoAfastamento(status) {
    return STATUS_FUNCIONARIO_AFASTAMENTO_TEMPORARIO.includes(String(status || ''));
}

/**
 * @param {unknown} valor
 * @returns {Date | null}
 */
export function inicioDoDia(valor) {
    return parsearDataSomenteDia(valor);
}

/**
 * @param {Date | null} dataRetorno
 * @param {Date} [referencia]
 * @returns {boolean}
 */
export function afastamentoTemporarioExpirado(dataRetorno, referencia = new Date()) {
    const retorno = inicioDoDia(dataRetorno);
    const hoje = inicioDoDia(referencia);

    if (!retorno || !hoje) {
        return false;
    }

    return retorno.getTime() <= hoje.getTime();
}
