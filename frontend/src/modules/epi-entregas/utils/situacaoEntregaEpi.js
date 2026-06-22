export const SITUACAO_EPI_ENTREGA = {
    EM_DIA: 'EM_DIA',
    VENCIDO: 'VENCIDO',
    PENDENTE: 'PENDENTE',
    SEM_PERIODICIDADE: 'SEM_PERIODICIDADE'
};

export const ROTULO_SITUACAO_EPI = {
    [SITUACAO_EPI_ENTREGA.EM_DIA]: 'Em dia',
    [SITUACAO_EPI_ENTREGA.VENCIDO]: 'Vencido',
    [SITUACAO_EPI_ENTREGA.PENDENTE]: 'Pendente',
    [SITUACAO_EPI_ENTREGA.SEM_PERIODICIDADE]: 'Sem periodicidade'
};

/**
 * @param {string} situacao
 */
export function obterRotuloSituacaoEpi(situacao) {
    return ROTULO_SITUACAO_EPI[situacao] || situacao;
}

/**
 * @param {string} situacao
 */
export function obterClasseSituacaoEpi(situacao) {
    switch (situacao) {
        case SITUACAO_EPI_ENTREGA.VENCIDO:
            return 'status-badge status-badge--offline';
        case SITUACAO_EPI_ENTREGA.PENDENTE:
            return 'status-badge status-badge--afastado';
        case SITUACAO_EPI_ENTREGA.EM_DIA:
            return 'status-badge status-badge--ativo';
        default:
            return 'status-badge';
    }
}

/**
 * @param {string | Date | null | undefined} valor
 */
export function formatarDataEntregaEpi(valor) {
    if (!valor) {
        return '—';
    }

    const data = valor instanceof Date ? valor : new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return '—';
    }

    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(data);
}
