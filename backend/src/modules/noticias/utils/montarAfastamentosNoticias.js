import { STATUS_FUNCIONARIO_AFASTAMENTO_TEMPORARIO } from '../../employees/constants/funcionarioStatusConstantes.js';

const ROTULOS_STATUS_AFASTAMENTO = {
    FERIAS: 'Férias',
    LICENCA_MATERNIDADE: 'Licença maternidade',
    LICENCA_MED: 'Licença médica'
};

/**
 * @param {unknown} valor
 * @returns {Date | null}
 */
export function inicioDoDia(valor) {
    if (valor === null || valor === undefined || valor === '') {
        return null;
    }

    const referencia = valor instanceof Date ? valor : new Date(String(valor).trim());

    if (Number.isNaN(referencia.getTime())) {
        return null;
    }

    return new Date(
        Date.UTC(referencia.getUTCFullYear(), referencia.getUTCMonth(), referencia.getUTCDate())
    );
}

/**
 * @param {Date} referencia
 * @returns {Date}
 */
export function fimDoMes(referencia) {
    const data = inicioDoDia(referencia);

    if (!data) {
        return new Date();
    }

    return new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth() + 1, 0));
}

/**
 * @param {Date | null} data
 * @returns {string}
 */
export function formatarDataBr(data) {
    if (!data) {
        return '—';
    }

    const dia = String(data.getUTCDate()).padStart(2, '0');
    const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
    const ano = data.getUTCFullYear();

    return `${dia}/${mes}/${ano}`;
}

/**
 * @param {string} status
 * @returns {string}
 */
export function rotuloStatusAfastamento(status) {
    return ROTULOS_STATUS_AFASTAMENTO[status] || status;
}

/**
 * @param {Array<Record<string, unknown>>} funcionarios
 * @param {Date} [dataReferencia]
 */
export function montarPainelAfastamentosNoticias(funcionarios, dataReferencia = new Date()) {
    const hoje = inicioDoDia(dataReferencia);
    const ultimoDiaMes = fimDoMes(hoje);

    if (!hoje) {
        return { saindo: [], voltando: [] };
    }

    const saindo = [];
    const voltando = [];

    for (const funcionario of funcionarios) {
        const status = String(funcionario.status || '');
        if (!STATUS_FUNCIONARIO_AFASTAMENTO_TEMPORARIO.includes(status)) {
            continue;
        }

        const dataRetorno = funcionario.leaveReturnDate
            ? inicioDoDia(funcionario.leaveReturnDate)
            : null;
        const empresa =
            funcionario.company && typeof funcionario.company === 'object'
                ? String(funcionario.company.name || '—')
                : '—';

        const registroBase = {
            id: String(funcionario.id),
            nome: String(funcionario.name || ''),
            empresa,
            situacao: rotuloStatusAfastamento(status),
            previsaoRetorno: formatarDataBr(dataRetorno),
            dataRetorno: formatarDataBr(dataRetorno),
            _ordenacaoRetorno: dataRetorno ? dataRetorno.getTime() : Number.MAX_SAFE_INTEGER
        };

        const retornaNoMes =
            dataRetorno && dataRetorno.getTime() >= hoje.getTime() && dataRetorno.getTime() <= ultimoDiaMes.getTime();

        if (retornaNoMes) {
            voltando.push(registroBase);
        } else {
            saindo.push(registroBase);
        }
    }

    const ordenarPorRetorno = (lista) =>
        [...lista].sort((a, b) => a._ordenacaoRetorno - b._ordenacaoRetorno);

    return {
        saindo: ordenarPorRetorno(saindo).map(({ _ordenacaoRetorno, ...item }) => item),
        voltando: ordenarPorRetorno(voltando).map(({ _ordenacaoRetorno, ...item }) => item)
    };
}

/**
 * @param {Date} [dataReferencia]
 * @returns {string}
 */
export function obterMesReferenciaAfastamentos(dataReferencia = new Date()) {
    return dataReferencia.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}
