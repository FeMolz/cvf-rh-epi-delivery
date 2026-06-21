import { requisicaoApi } from '../../../shared/api/clienteHttp.js';

/**
 * @param {string} roleId
 * @param {string} token
 */
export function listarEpisPorCargo(roleId, token) {
    return requisicaoApi(`/roles-epis/${roleId}`, { token });
}

/**
 * @param {{ roleId: string, caNumber: string, periodicityDays: number }} dados
 * @param {string} token
 */
export function vincularEpiAoCargo(dados, token) {
    return requisicaoApi('/roles-epis', {
        method: 'POST',
        body: dados,
        token
    });
}

/**
 * @param {string} roleId
 * @param {string} epiId
 * @param {string} token
 */
export function desvincularEpiDoCargo(roleId, epiId, token) {
    return requisicaoApi(`/roles-epis/${roleId}/${epiId}`, {
        method: 'DELETE',
        token
    });
}
