import {
    empresaEstaAtiva,
    filtrarEmpresasPorSituacao
} from '../../empresas/utils/listagemEmpresas.js';

/**
 * @param {Array<Record<string, unknown>>} empresas
 */
export function filtrarEmpresasAtivasParaFuncionario(empresas) {
    return filtrarEmpresasPorSituacao(empresas, false);
}

/**
 * @param {Array<Record<string, unknown>>} empresas
 * @param {string} [empresaAtualId]
 * @param {{ id?: string, name?: string, isActive?: boolean } | null} [empresaAtual]
 */
export function montarEmpresasParaFormularioFuncionario(empresas, empresaAtualId = '', empresaAtual = null) {
    const empresasAtivas = filtrarEmpresasAtivasParaFuncionario(empresas);
    const idAtual = empresaAtualId ? String(empresaAtualId) : '';

    if (!idAtual || empresasAtivas.some((empresa) => String(empresa.id) === idAtual)) {
        return empresasAtivas;
    }

    const empresaInativa =
        empresas.find((empresa) => String(empresa.id) === idAtual) ||
        (empresaAtual?.id ? empresaAtual : null);

    if (!empresaInativa) {
        return empresasAtivas;
    }

    return [
        {
            ...empresaInativa,
            name: `${empresaInativa.name} (inativa)`
        },
        ...empresasAtivas
    ];
}
