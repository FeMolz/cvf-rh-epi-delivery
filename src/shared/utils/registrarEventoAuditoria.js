import { TIPOS_EVENTO_AUDITORIA } from '../constants/segurancaConstantes.js';

export { TIPOS_EVENTO_AUDITORIA };

/**
 * @param {string} tipoEvento
 * @param {Record<string, unknown>} detalhes
 */
export function registrarEventoAuditoria(tipoEvento, detalhes = {}) {
    const registro = {
        tipo: 'AUDITORIA_SEGURANCA',
        evento: tipoEvento,
        registradoEm: new Date().toISOString(),
        ...detalhes
    };

    console.info(JSON.stringify(registro));
}
