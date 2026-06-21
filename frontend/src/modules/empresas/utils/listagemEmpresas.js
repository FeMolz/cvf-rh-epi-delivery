/**
 * @param {Record<string, unknown>} empresa
 */
export function empresaEstaAtiva(empresa) {
    return empresa.isActive !== false;
}

/**
 * @param {Record<string, unknown>} empresa
 */
export function obterRotuloStatusEmpresa(empresa) {
    return empresaEstaAtiva(empresa) ? 'Ativa' : 'Inativa';
}

/**
 * @param {Record<string, unknown>} empresa
 */
export function obterClasseStatusEmpresa(empresa) {
    return empresaEstaAtiva(empresa)
        ? 'status-badge status-badge--ativo'
        : 'status-badge status-badge--offline';
}

/**
 * @param {Array<Record<string, unknown>>} empresas
 * @param {boolean} apenasInativas
 */
export function filtrarEmpresasPorSituacao(empresas, apenasInativas) {
    return empresas.filter((empresa) =>
        apenasInativas ? !empresaEstaAtiva(empresa) : empresaEstaAtiva(empresa)
    );
}

/**
 * @param {Array<Record<string, unknown>>} empresas
 * @param {string} termoBusca
 */
export function filtrarEmpresas(empresas, termoBusca) {
    const termo = termoBusca.trim().toLowerCase();

    if (!termo) {
        return empresas;
    }

    return empresas.filter((empresa) => {
        const status = obterRotuloStatusEmpresa(empresa).toLowerCase();
        const campos = [empresa.name, empresa.cnpj, status]
            .filter(Boolean)
            .map((campo) => String(campo).toLowerCase());

        return campos.some((campo) => campo.includes(termo));
    });
}
