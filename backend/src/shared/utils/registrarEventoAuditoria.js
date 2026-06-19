import { TIPOS_EVENTO_AUDITORIA } from '../constants/segurancaConstantes.js';
import eventoAuditoriaSegurancaRepository from '../repositories/EventoAuditoriaSegurancaRepository.js';

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

    eventoAuditoriaSegurancaRepository
        .registrar(tipoEvento, detalhes)
        .catch((erro) => {
            console.error('[Auditoria] Falha ao persistir evento:', erro.message);
        });
}
