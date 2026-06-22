/**
 * @param {{ totalEpis?: number, vencidos?: number, pendentes?: number, emDia?: number }} resumo
 */
export function obterMensagemResumoEpisFuncionario(resumo = {}) {
    const totalEpis = Number(resumo.totalEpis) || 0;
    const vencidos = Number(resumo.vencidos) || 0;
    const pendentes = Number(resumo.pendentes) || 0;

    if (totalEpis === 0) {
        return 'Tudo em dia';
    }

    if (vencidos >= 3) {
        return `Muitos vencidos (${vencidos})`;
    }

    if (vencidos > 0 && pendentes > 0) {
        return `${vencidos} vencido(s), ${pendentes} pendente(s)`;
    }

    if (vencidos > 0) {
        return vencidos === 1 ? '1 EPI vencido' : `${vencidos} EPIs vencidos`;
    }

    if (pendentes > 0) {
        return pendentes === 1 ? '1 entrega pendente' : `${pendentes} entregas pendentes`;
    }

    return 'Tudo em dia';
}

/**
 * @param {{ vencidos?: number, pendentes?: number }} resumo
 */
export function obterClasseResumoEpisFuncionario(resumo = {}) {
    const vencidos = Number(resumo.vencidos) || 0;
    const pendentes = Number(resumo.pendentes) || 0;

    if (vencidos >= 3) {
        return 'status-badge status-badge--offline';
    }

    if (vencidos > 0) {
        return 'status-badge status-badge--offline';
    }

    if (pendentes > 0) {
        return 'status-badge status-badge--afastado';
    }

    return 'status-badge status-badge--ativo';
}
