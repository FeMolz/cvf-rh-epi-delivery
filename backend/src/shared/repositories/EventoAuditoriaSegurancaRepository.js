import prisma from '../../config/database.js';

class EventoAuditoriaSegurancaRepository {
    /**
     * @param {string} tipoEvento
     * @param {Record<string, unknown>} detalhes
     */
    async registrar(tipoEvento, detalhes) {
        return prisma.eventoAuditoriaSeguranca.create({
            data: {
                tipoEvento,
                detalhes
            }
        });
    }
}

export default new EventoAuditoriaSegurancaRepository();
