/**
 * @param {Record<string, unknown>} setor
 */
export function setorEstaAtivo(setor) {
    return setor.isActive !== false;
}

/**
 * @param {Record<string, unknown>} setor
 */
export function obterRotuloStatusSetor(setor) {
    return setorEstaAtivo(setor) ? 'Ativo' : 'Inativo';
}

/**
 * @param {Record<string, unknown>} setor
 */
export function obterClasseStatusSetor(setor) {
    return setorEstaAtivo(setor)
        ? 'status-badge status-badge--ativo'
        : 'status-badge status-badge--offline';
}

/**
 * @param {Array<Record<string, unknown>>} setores
 * @param {boolean} apenasInativos
 */
export function filtrarSetoresPorSituacao(setores, apenasInativos) {
    return setores.filter((setor) =>
        apenasInativos ? !setorEstaAtivo(setor) : setorEstaAtivo(setor)
    );
}

/**
 * @param {Array<Record<string, unknown>>} setores
 * @param {string} termoBusca
 */
export function filtrarSetores(setores, termoBusca) {
    const termo = termoBusca.trim().toLowerCase();

    if (!termo) {
        return setores;
    }

    return setores.filter((setor) => {
        const status = obterRotuloStatusSetor(setor).toLowerCase();
        const campos = [setor.nome, status]
            .filter(Boolean)
            .map((campo) => String(campo).toLowerCase());

        return campos.some((campo) => campo.includes(termo));
    });
}
