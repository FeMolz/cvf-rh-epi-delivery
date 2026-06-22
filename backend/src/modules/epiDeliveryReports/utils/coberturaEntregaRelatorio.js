/**
 * @param {Date | string} dataEntrega
 * @param {Date | string} periodoInicio
 * @param {Date | string} periodoFim
 */
export function entregaCobertaPorRelatorio(dataEntrega, periodoInicio, periodoFim) {
    const instanteEntrega = new Date(dataEntrega).getTime();
    const instanteInicio = new Date(periodoInicio).getTime();
    const instanteFim = new Date(periodoFim).getTime();

    return instanteEntrega >= instanteInicio && instanteEntrega <= instanteFim;
}

/**
 * @param {Array<{ deliveryDate: Date | string }>} entregas
 * @param {Array<{ periodStartDate: Date | string, periodEndDate: Date | string }>} relatorios
 */
export function possuiEntregaPendenteEmissao(entregas = [], relatorios = []) {
    if (!entregas.length) {
        return false;
    }

    if (!relatorios.length) {
        return true;
    }

    return entregas.some(
        (entrega) =>
            !relatorios.some((relatorio) =>
                entregaCobertaPorRelatorio(
                    entrega.deliveryDate,
                    relatorio.periodStartDate,
                    relatorio.periodEndDate
                )
            )
    );
}
