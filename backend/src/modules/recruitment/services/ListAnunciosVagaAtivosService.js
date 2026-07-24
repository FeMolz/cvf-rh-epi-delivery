import { STATUS_ANUNCIO_VAGA } from '../constants/recrutamentoConstantes.js';
import anuncioVagaRepository from '../repositories/AnuncioVagaRepository.js';

class ListAnunciosVagaAtivosService {
    async execute() {
        return anuncioVagaRepository.findMany({ status: STATUS_ANUNCIO_VAGA.ATIVA });
    }
}

export default new ListAnunciosVagaAtivosService();
