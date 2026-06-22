const formatadorDataEntrega = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeZone: 'UTC'
});

/**
 * @param {Array<{ deliveryDate: Date | string, epi: { name: string, caNumber: string | number } }>} entregasNoPeriodo
 * @returns {Array<{ dataEntrega: string, nomeEquipamento: string, numeroCa: string }>}
 */
export function montarEntregasTabelaRelatorio(entregasNoPeriodo) {
    return entregasNoPeriodo.map((registroEntrega) => ({
        dataEntrega: formatadorDataEntrega.format(registroEntrega.deliveryDate),
        nomeEquipamento: registroEntrega.epi.name,
        numeroCa: String(registroEntrega.epi.caNumber)
    }));
}
