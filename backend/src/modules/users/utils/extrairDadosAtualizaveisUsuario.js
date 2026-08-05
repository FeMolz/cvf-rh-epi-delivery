import { normalizarTextoMaiusculo } from '../../../shared/utils/normalizarTextoMaiusculo.js';

/** Campos permitidos em PUT /users/:id (isActive não é editável pela API). */
export const CAMPOS_USUARIO_EDITAVEIS = ['name', 'email', 'role'];

/**
 * @param {Record<string, unknown>} dadosBrutos
 * @returns {Record<string, string>}
 */
export function extrairDadosAtualizaveisUsuario(dadosBrutos) {
    const dadosPermitidos = {};

    for (const campo of CAMPOS_USUARIO_EDITAVEIS) {
        if (dadosBrutos[campo] !== undefined) {
            dadosPermitidos[campo] =
                campo === 'name'
                    ? normalizarTextoMaiusculo(dadosBrutos[campo])
                    : dadosBrutos[campo];
        }
    }

    return dadosPermitidos;
}

/**
 * @param {Record<string, unknown>} dadosBrutos
 * @returns {boolean}
 */
export function contemCampoIsActiveNosDados(dadosBrutos) {
    return Object.prototype.hasOwnProperty.call(dadosBrutos, 'isActive');
}
