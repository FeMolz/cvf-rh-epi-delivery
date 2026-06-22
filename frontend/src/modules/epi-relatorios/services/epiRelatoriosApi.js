import { baixarArquivoApi, requisicaoApi } from '../../../shared/api/clienteHttp.js';

/**
 * @param {string} token
 * @param {{
 *   employeeId?: string,
 *   foiAssinado?: string,
 *   emissaoInicio?: string,
 *   emissaoFim?: string,
 *   ultimosDias?: number,
 *   pagina?: number,
 *   limite?: number
 * }} [filtros]
 */
export function listarRelatoriosEntregaEpi(token, filtros = {}) {
    const parametros = new URLSearchParams();

    if (filtros.employeeId) {
        parametros.set('employeeId', filtros.employeeId);
    }

    if (filtros.foiAssinado !== undefined && filtros.foiAssinado !== '') {
        parametros.set('foiAssinado', String(filtros.foiAssinado));
    }

    if (filtros.emissaoInicio) {
        parametros.set('emissaoInicio', filtros.emissaoInicio);
    }

    if (filtros.emissaoFim) {
        parametros.set('emissaoFim', filtros.emissaoFim);
    }

    if (filtros.ultimosDias) {
        parametros.set('ultimosDias', String(filtros.ultimosDias));
    }

    if (filtros.pagina) {
        parametros.set('pagina', String(filtros.pagina));
    }

    if (filtros.limite) {
        parametros.set('limite', String(filtros.limite));
    }

    const consulta = parametros.toString();
    const caminho = consulta ? `/epi-delivery-reports?${consulta}` : '/epi-delivery-reports';

    return requisicaoApi(caminho, { token });
}

/**
 * @param {string} token
 * @param {{ employeeId: string, periodoInicio: string, periodoFim: string }} filtros
 */
export function buscarPreviewRelatorioEntregaEpi(token, filtros) {
    const parametros = new URLSearchParams({
        employeeId: filtros.employeeId,
        periodoInicio: filtros.periodoInicio,
        periodoFim: filtros.periodoFim
    });

    return requisicaoApi(`/epi-delivery-reports/preview?${parametros}`, { token });
}

/**
 * @param {string} token
 */
export function listarFuncionariosElegiveisEmissaoRelatorio(token) {
    return requisicaoApi('/epi-delivery-reports/employees/eligible-for-emission', { token });
}

/**
 * @param {string} token
 */
export function listarFuncionariosComHistoricoEmissoes(token) {
    return requisicaoApi('/epi-delivery-reports/employees/with-reports', { token });
}

/**
 * @param {string} employeeId
 * @param {string} token
 */
export function listarArquivoRelatoriosFuncionario(employeeId, token) {
    return requisicaoApi(`/epi-delivery-reports/employee/${employeeId}/archive`, { token });
}

/**
 * @param {{ employeeId: string, periodoInicio: string, periodoFim: string }} dados
 * @param {string} token
 */
export function emitirRelatorioEntregaEpi(dados, token) {
    return requisicaoApi('/epi-delivery-reports', {
        method: 'POST',
        body: dados,
        token
    });
}

/**
 * @param {string} relatorioId
 * @param {{ foiImpresso?: boolean, foiEncaminhado?: boolean, foiAssinado?: boolean }} flags
 * @param {string} token
 */
export function atualizarFlagsRelatorioEntregaEpi(relatorioId, flags, token) {
    return requisicaoApi(`/epi-delivery-reports/${relatorioId}/flags`, {
        method: 'PATCH',
        body: flags,
        token
    });
}

/**
 * @param {string} relatorioId
 * @param {string} token
 * @param {string} [nomeArquivoPadrao]
 */
export function baixarPdfRelatorioEntregaEpi(relatorioId, token, nomeArquivoPadrao = 'relatorio-epi.pdf') {
    return baixarArquivoApi(`/epi-delivery-reports/${relatorioId}/pdf`, {
        token,
        nomeArquivoPadrao
    });
}
