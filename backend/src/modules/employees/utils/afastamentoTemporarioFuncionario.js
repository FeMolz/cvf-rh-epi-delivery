import { STATUS_FUNCIONARIO_AFASTAMENTO_TEMPORARIO } from '../constants/funcionarioStatusConstantes.js';

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
    if (valor === null || valor === undefined || valor === '') {
        return null;
    }

    const data = valor instanceof Date ? new Date(valor) : new Date(String(valor).trim());

    if (Number.isNaN(data.getTime())) {
        return null;
    }

    data.setHours(0, 0, 0, 0);
    return data;
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
