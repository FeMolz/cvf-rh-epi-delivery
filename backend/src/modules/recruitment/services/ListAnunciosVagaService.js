import { STATUS_ANUNCIO_VAGA } from '../constants/recrutamentoConstantes.js';
import anuncioVagaRepository from '../repositories/AnuncioVagaRepository.js';

class ListAnunciosVagaService {
    /**
     * @param {{ status?: string }} filtros
     */
    async execute(filtros = {}) {
        const statusFiltro =
            typeof filtros.status === 'string' && filtros.status.trim()
                ? filtros.status.trim().toUpperCase()
                : undefined;

        if (statusFiltro && !Object.values(STATUS_ANUNCIO_VAGA).includes(statusFiltro)) {
            return [];
        }

        return anuncioVagaRepository.findMany({ status: statusFiltro });
    }
}

export default new ListAnunciosVagaService();
