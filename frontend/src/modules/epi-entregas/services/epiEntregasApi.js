import { requisicaoApi } from '../../../shared/api/clienteHttp.js';

/**
 * @param {string} token
 */
export function buscarPainelEntregasEpi(token) {
    return requisicaoApi('/epi-deliveries/painel', { token });
}

/**
 * @param {string} employeeId
 * @param {string} token
 */
export function buscarSituacaoEpisFuncionario(employeeId, token) {
    return requisicaoApi(`/epi-deliveries/painel/funcionario/${employeeId}`, { token });
}

/**
 * @param {{ employeeId: string, caNumbers: string[], deliveryDate?: string }} dados
 * @param {string} token
 */
export function registrarEntregaEpi(dados, token) {
    const corpo = {
        employeeId: dados.employeeId,
        caNumbers: dados.caNumbers
    };

    if (dados.deliveryDate) {
        corpo.deliveryDate = dados.deliveryDate;
    }

    return requisicaoApi('/epi-deliveries', {
        method: 'POST',
        body: corpo,
        token
    });
}
