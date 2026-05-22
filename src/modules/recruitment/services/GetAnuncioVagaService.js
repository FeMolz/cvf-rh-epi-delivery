import { MENSAGEM_ANUNCIO_NAO_ENCONTRADO } from '../constants/recrutamentoConstantes.js';
import anuncioVagaRepository from '../repositories/AnuncioVagaRepository.js';

class GetAnuncioVagaService {
    /**
     * @param {string} identificadorAnuncio
     */
    async execute(identificadorAnuncio) {
        const anuncio = await anuncioVagaRepository.findById(identificadorAnuncio);
        if (!anuncio) {
            throw new Error(MENSAGEM_ANUNCIO_NAO_ENCONTRADO);
        }
        return anuncio;
    }
}

export default new GetAnuncioVagaService();
