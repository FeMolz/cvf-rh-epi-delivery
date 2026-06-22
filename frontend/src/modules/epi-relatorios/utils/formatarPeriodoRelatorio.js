/**
 * @param {string | Date | null | undefined} valor
 */
export function formatarDataRelatorio(valor) {
    if (!valor) {
        return '—';
    }

    const data = valor instanceof Date ? valor : new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return '—';
    }

    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'UTC' }).format(data);
}

/**
 * @param {string | Date | null | undefined} inicio
 * @param {string | Date | null | undefined} fim
 */
export function formatarPeriodoRelatorio(inicio, fim) {
    const inicioFormatado = formatarDataRelatorio(inicio);
    const fimFormatado = formatarDataRelatorio(fim);

    if (inicioFormatado === '—' && fimFormatado === '—') {
        return '—';
    }

    return `${inicioFormatado} – ${fimFormatado}`;
}
