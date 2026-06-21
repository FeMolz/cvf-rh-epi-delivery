import { requisicaoApi } from '../../../shared/api/clienteHttp.js';

/**
 * @param {string} nome
 * @param {string} token
 */
export function buscarEpisPorNome(nome, token) {
    const parametros = new URLSearchParams({ nome: nome.trim() });
    return requisicaoApi(`/epis/buscar-por-nome?${parametros.toString()}`, { token });
}

/**
 * @param {string} token
 */
export function listarEpis(token) {
    return requisicaoApi('/epis', { token });
}

/**
 * @param {string} caNumber
 * @param {string} token
 */
export function buscarEpiPorCa(caNumber, token) {
    return requisicaoApi(`/epis/${encodeURIComponent(caNumber)}`, { token });
}

/**
 * @param {{ roleId: string, epiId: string, newPeriodicityDays: number }} dados
 * @param {string} token
 */
export function alterarPeriodicidadeEpi(dados, token) {
    return requisicaoApi('/epis/periodicity', {
        method: 'PUT',
        body: dados,
        token
    });
}
