export const STATUS_DOCUMENTO_OPCOES = [
    { id: 'recem_emitido', rotulo: 'Recém-emitido' },
    { id: 'impresso', rotulo: 'Impresso' },
    { id: 'encaminhado', rotulo: 'Encaminhado' },
    { id: 'assinado', rotulo: 'Assinado' }
];

/**
 * @param {{ foiImpresso?: boolean, foiEncaminhado?: boolean, foiAssinado?: boolean }} relatorio
 */
export function obterStatusAtualDocumento(relatorio = {}) {
    if (relatorio.foiAssinado) {
        return 'assinado';
    }

    if (relatorio.foiEncaminhado) {
        return 'encaminhado';
    }

    if (relatorio.foiImpresso) {
        return 'impresso';
    }

    return 'recem_emitido';
}

/**
 * @param {'recem_emitido' | 'impresso' | 'encaminhado' | 'assinado'} statusId
 */
export function obterFlagsParaStatusDocumento(statusId) {
    switch (statusId) {
        case 'impresso':
            return { foiImpresso: true, foiEncaminhado: false, foiAssinado: false };
        case 'encaminhado':
            return { foiImpresso: true, foiEncaminhado: true, foiAssinado: false };
        case 'assinado':
            return { foiImpresso: true, foiEncaminhado: true, foiAssinado: true };
        default:
            return { foiImpresso: false, foiEncaminhado: false, foiAssinado: false };
    }
}

/**
 * @param {{ foiImpresso?: boolean, foiEncaminhado?: boolean, foiAssinado?: boolean }} relatorio
 */
export function obterRotuloResumoStatusDocumento(relatorio = {}) {
    const opcao = STATUS_DOCUMENTO_OPCOES.find(
        (item) => item.id === obterStatusAtualDocumento(relatorio)
    );

    return opcao?.rotulo || 'Recém-emitido';
}

/**
 * @param {'recem_emitido' | 'impresso' | 'encaminhado' | 'assinado'} statusId
 */
export function obterClasseBaseStatusDocumento(statusId) {
    switch (statusId) {
        case 'assinado':
            return 'status-badge--ativo';
        case 'encaminhado':
            return 'status-badge--afastado';
        case 'impresso':
            return 'epi-relatorios__status--impresso';
        default:
            return 'epi-relatorios__status--recem';
    }
}

/**
 * @param {{ foiImpresso?: boolean, foiEncaminhado?: boolean, foiAssinado?: boolean }} relatorio
 */
export function obterClasseResumoStatusDocumento(relatorio = {}) {
    const statusAtual = obterStatusAtualDocumento(relatorio);

    return `status-badge ${obterClasseBaseStatusDocumento(statusAtual)}`;
}

/**
 * @param {'recem_emitido' | 'impresso' | 'encaminhado' | 'assinado'} statusId
 */
export function obterClasseSelectStatusDocumento(statusId) {
    return `epi-relatorios__status-select epi-relatorios__status-select--${statusId}`;
}

/**
 * @param {{ id?: string, foiImpresso?: boolean, foiEncaminhado?: boolean, foiAssinado?: boolean }} relatorio
 * @param {Set<string>} relatoriosComDownload
 */
export function documentoLiberadoParaAlterarStatus(relatorio, relatoriosComDownload) {
    if (!relatorio?.id) {
        return false;
    }

    if (relatoriosComDownload.has(String(relatorio.id))) {
        return true;
    }

    return Boolean(relatorio.foiImpresso || relatorio.foiEncaminhado || relatorio.foiAssinado);
}
