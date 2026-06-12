import { MENSAGEM_ANUNCIO_NAO_ENCONTRADO } from '../constants/recrutamentoConstantes.js';
import anuncioVagaRepository from '../repositories/AnuncioVagaRepository.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';

class GetAnuncioVagaService {
    /**
     * @param {string} identificadorAnuncio
     */
    async execute(identificadorAnuncio) {
        const anuncio = await anuncioVagaRepository.findById(identificadorAnuncio);
        if (!anuncio) {
            lancarErroRecrutamento(MENSAGEM_ANUNCIO_NAO_ENCONTRADO);
        }
        return anuncio;
    }
}

export default new GetAnuncioVagaService();
