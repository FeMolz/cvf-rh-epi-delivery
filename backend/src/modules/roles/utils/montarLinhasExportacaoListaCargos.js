/**
 * @param {Date | string | null | undefined} valor
 */
function formatarDataHoraExportacao(valor) {
    if (!valor) {
        return '—';
    }

    const data = valor instanceof Date ? valor : new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return '—';
    }

    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    }).format(data);
}

/**
 * @param {Record<string, unknown>} cargo
 */
function obterQuantidadeEpis(cargo) {
    const contagem = cargo._count;

    if (contagem && typeof contagem === 'object' && 'roleEpis' in contagem) {
        return Number(contagem.roleEpis) || 0;
    }

    return 0;
}

/**
 * @param {Array<Record<string, unknown>>} cargos
 */
export function montarLinhasExportacaoListaCargos(cargos) {
    return cargos.map((cargo) => ({
        nome: String(cargo.name || ''),
        descricao: String(cargo.description || ''),
        epis: obterQuantidadeEpis(cargo),
        situacao: cargo.deletedAt ? 'Inativo' : 'Ativo',
        criadoEm: formatarDataHoraExportacao(cargo.createdAt),
        inativadoEm: formatarDataHoraExportacao(cargo.deletedAt)
    }));
}
