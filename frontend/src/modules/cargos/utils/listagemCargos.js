/**
 * @param {Record<string, unknown>} cargo
 */
export function cargoEstaAtivo(cargo) {
    return !cargo.deletedAt;
}

/**
 * @param {Record<string, unknown>} cargo
 */
export function obterRotuloStatusCargo(cargo) {
    return cargoEstaAtivo(cargo) ? 'Ativo' : 'Inativo';
}

/**
 * @param {string | Date | null | undefined} valor
 */
export function formatarData(valor) {
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
 * @param {Record<string, unknown>} cargo
 */
export function obterQuantidadeEpis(cargo) {
    const contagem = cargo._count;

    if (contagem && typeof contagem === 'object' && 'roleEpis' in contagem) {
        return Number(contagem.roleEpis) || 0;
    }

    return 0;
}

/**
 * @param {Array<Record<string, unknown>>} cargos
 * @param {string} termoBusca
 */
export function filtrarCargos(cargos, termoBusca) {
    const termo = termoBusca.trim().toLowerCase();

    if (!termo) {
        return cargos;
    }

    return cargos.filter((cargo) => {
        const quantidadeEpis = String(obterQuantidadeEpis(cargo));
        const status = obterRotuloStatusCargo(cargo).toLowerCase();
        const campos = [cargo.name, cargo.description, quantidadeEpis, status]
            .filter(Boolean)
            .map((campo) => String(campo).toLowerCase());

        return campos.some((campo) => campo.includes(termo));
    });
}
