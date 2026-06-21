/**
 * @param {Record<string, unknown>} epi
 */
export function epiEstaAtivo(epi) {
    return epi.isActive !== false;
}

/**
 * @param {Record<string, unknown>} epi
 */
export function obterRotuloStatusEpi(epi) {
    return epiEstaAtivo(epi) ? 'Ativo' : 'Inativo';
}

/**
 * @param {Record<string, unknown>} epi
 */
export function obterClasseStatusEpi(epi) {
    return epiEstaAtivo(epi)
        ? 'status-badge status-badge--ativo'
        : 'status-badge status-badge--offline';
}

/**
 * @param {string | Date | null | undefined} valor
 */
export function formatarDataValidadeEpi(valor) {
    if (!valor) {
        return '—';
    }

    const data = valor instanceof Date ? valor : new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return '—';
    }

    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short'
    }).format(data);
}

/**
 * @param {Array<Record<string, unknown>>} epis
 * @param {boolean} apenasInativos
 */
export function filtrarEpisPorSituacao(epis, apenasInativos) {
    return epis.filter((epi) => (apenasInativos ? !epiEstaAtivo(epi) : epiEstaAtivo(epi)));
}

/**
 * @param {Array<Record<string, unknown>>} epis
 * @param {string} termoBusca
 */
export function filtrarEpis(epis, termoBusca) {
    const termo = termoBusca.trim().toLowerCase();

    if (!termo) {
        return epis;
    }

    return epis.filter((epi) => {
        const status = obterRotuloStatusEpi(epi).toLowerCase();
        const campos = [epi.name, epi.caNumber, status]
            .filter(Boolean)
            .map((campo) => String(campo).toLowerCase());

        return campos.some((campo) => campo.includes(termo));
    });
}

/**
 * @param {Record<string, unknown>} vinculo
 */
export function normalizarVinculoEpiCargo(vinculo) {
    const epi = vinculo.epi || {};

    return {
        vinculoId: String(vinculo.id || ''),
        epiId: String(epi.id || vinculo.epiId || ''),
        name: String(epi.name || '—'),
        caNumber: String(epi.caNumber || '—'),
        caExpirationDate: epi.caExpirationDate,
        isActive: epi.isActive !== false,
        periodicityDays: Number(vinculo.periodicityDays) || 0
    };
}

/**
 * @param {Array<Record<string, unknown>>} vinculos
 * @param {string} termoBusca
 */
export function filtrarVinculosEpiCargo(vinculos, termoBusca) {
    const termo = termoBusca.trim().toLowerCase();

    if (!termo) {
        return vinculos;
    }

    return vinculos.filter((vinculo) => {
        const item = normalizarVinculoEpiCargo(vinculo);
        const campos = [item.name, item.caNumber, String(item.periodicityDays)]
            .map((campo) => campo.toLowerCase());

        return campos.some((campo) => campo.includes(termo));
    });
}

/**
 * @param {Array<Record<string, unknown>>} episCache
 * @param {Array<Record<string, unknown>>} vinculos
 */
export function filtrarEpisCacheDisponiveisParaVinculo(episCache, vinculos) {
    const idsVinculados = new Set(
        vinculos
            .map((vinculo) => {
                const item = normalizarVinculoEpiCargo(vinculo);
                return item.epiId;
            })
            .filter(Boolean)
    );

    return episCache.filter((epi) => epiEstaAtivo(epi) && !idsVinculados.has(String(epi.id)));
}
