export const SITUACAO_EPI_ENTREGA = {
    EM_DIA: 'EM_DIA',
    VENCIDO: 'VENCIDO',
    PENDENTE: 'PENDENTE',
    SEM_PERIODICIDADE: 'SEM_PERIODICIDADE'
};

/**
 * @param {Date | string} [referencia]
 */
export function obterInicioDoDia(referencia = new Date()) {
    const data = new Date(referencia);
    data.setHours(0, 0, 0, 0);
    return data;
}

/**
 * @param {Array<{ epiId?: string, epi?: { id?: string }, deliveryDate?: Date | string }>} entregas
 */
export function agruparUltimasEntregasPorEpi(entregas) {
    const mapa = new Map();

    for (const entrega of entregas) {
        const epiId = String(entrega.epiId || entrega.epi?.id || '');

        if (!epiId || mapa.has(epiId)) {
            continue;
        }

        mapa.set(epiId, entrega);
    }

    return mapa;
}

/**
 * @param {{ periodicityDays?: number, ultimaEntrega?: Record<string, unknown> | null }} parametros
 */
export function calcularSituacaoEpiEntrega({ periodicityDays, ultimaEntrega }) {
    const periodicidade = Number(periodicityDays) || 0;

    if (!ultimaEntrega) {
        return SITUACAO_EPI_ENTREGA.PENDENTE;
    }

    if (periodicidade <= 0) {
        return SITUACAO_EPI_ENTREGA.SEM_PERIODICIDADE;
    }

    const proximoVencimento = ultimaEntrega.nextDueDate || ultimaEntrega.vencimentoSuspenso;

    if (!proximoVencimento) {
        return SITUACAO_EPI_ENTREGA.PENDENTE;
    }

    const vencimento = new Date(proximoVencimento);

    return vencimento < obterInicioDoDia()
        ? SITUACAO_EPI_ENTREGA.VENCIDO
        : SITUACAO_EPI_ENTREGA.EM_DIA;
}

/**
 * @param {string} situacao
 */
export function epiPrecisaEntrega(situacao) {
    return (
        situacao === SITUACAO_EPI_ENTREGA.VENCIDO ||
        situacao === SITUACAO_EPI_ENTREGA.PENDENTE
    );
}

/**
 * @param {Record<string, unknown>} funcionario
 */
export function montarSituacaoEpisFuncionario(funcionario) {
    const entregasPorEpi = agruparUltimasEntregasPorEpi(funcionario.epiDeliveries || []);
    const vinculosCargo = funcionario.role?.roleEpis || [];

    return vinculosCargo.map((vinculo) => {
        const epi = vinculo.epi || {};
        const epiId = String(epi.id || '');
        const ultimaEntrega = entregasPorEpi.get(epiId) || null;
        const situacao = calcularSituacaoEpiEntrega({
            periodicityDays: vinculo.periodicityDays,
            ultimaEntrega
        });

        return {
            epiId,
            name: String(epi.name || '—'),
            caNumber: String(epi.caNumber || '—'),
            caExpirationDate: epi.caExpirationDate ?? null,
            periodicityDays: Number(vinculo.periodicityDays) || 0,
            lastDeliveryDate: ultimaEntrega?.deliveryDate ?? null,
            nextDueDate:
                ultimaEntrega?.nextDueDate ?? ultimaEntrega?.vencimentoSuspenso ?? null,
            situacao
        };
    });
}

/**
 * @param {Array<Record<string, unknown>>} funcionarios
 */
export function montarEpisVencidosPorFuncionarios(funcionarios) {
    const itens = [];

    for (const funcionario of funcionarios) {
        const epis = montarSituacaoEpisFuncionario(funcionario);

        for (const epi of epis) {
            if (epi.situacao !== SITUACAO_EPI_ENTREGA.VENCIDO) {
                continue;
            }

            itens.push({
                employeeId: String(funcionario.id),
                employeeName: String(funcionario.name || '—'),
                epiId: epi.epiId,
                epiName: epi.name,
                caNumber: epi.caNumber,
                nextDueDate: epi.nextDueDate,
                lastDeliveryDate: epi.lastDeliveryDate
            });
        }
    }

    return itens.sort((a, b) => a.employeeName.localeCompare(b.employeeName, 'pt-BR'));
}

/**
 * @param {Array<{ situacao: string }>} epis
 */
export function montarResumoContagemEpis(epis) {
    let vencidos = 0;
    let pendentes = 0;
    let emDia = 0;

    for (const epi of epis) {
        if (epi.situacao === SITUACAO_EPI_ENTREGA.VENCIDO) {
            vencidos += 1;
        } else if (epi.situacao === SITUACAO_EPI_ENTREGA.PENDENTE) {
            pendentes += 1;
        } else {
            emDia += 1;
        }
    }

    return {
        totalEpis: epis.length,
        vencidos,
        pendentes,
        emDia
    };
}
