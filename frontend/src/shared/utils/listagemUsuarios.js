import { ROTULOS_PAPEIS } from '../constants/papeis.js';

/**
 * @param {string | Date | null | undefined} valor
 */
export function formatarDataHora(valor) {
    if (!valor) {
        return '—';
    }

    const data = valor instanceof Date ? valor : new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return '—';
    }

    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    }).format(data);
}

/**
 * @param {Array<Record<string, unknown>>} usuarios
 * @param {string} termoBusca
 */
export function filtrarUsuarios(usuarios, termoBusca) {
    const termo = termoBusca.trim().toLowerCase();

    if (!termo) {
        return usuarios;
    }

    return usuarios.filter((usuario) => {
        const papelRotulo = ROTULOS_PAPEIS[usuario.role] || String(usuario.role || '');
        const campos = [usuario.name, usuario.email, usuario.role, papelRotulo]
            .filter(Boolean)
            .map((campo) => String(campo).toLowerCase());

        return campos.some((campo) => campo.includes(termo));
    });
}

/**
 * @param {unknown[]} lista
 * @param {number} pagina
 * @param {number} itensPorPagina
 */
export function paginarLista(lista, pagina, itensPorPagina) {
    const totalItens = lista.length;
    const totalPaginas = Math.max(1, Math.ceil(totalItens / itensPorPagina));
    const paginaAtual = Math.min(Math.max(1, pagina), totalPaginas);
    const indiceInicio = (paginaAtual - 1) * itensPorPagina;
    const itens = lista.slice(indiceInicio, indiceInicio + itensPorPagina);

    return {
        itens,
        paginaAtual,
        totalPaginas,
        totalItens,
        itensPorPagina
    };
}
