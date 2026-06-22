import {
    MENSAGEM_ANUNCIO_NAO_ATIVO,
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    STATUS_ANUNCIO_VAGA
} from '../constants/recrutamentoConstantes.js';
import anuncioVagaRepository from '../repositories/AnuncioVagaRepository.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';

class GetAnuncioVagaPublicoService {
    /**
     * @param {string} identificadorAnuncio
     */
    async execute(identificadorAnuncio) {
        const anuncio = await anuncioVagaRepository.findById(identificadorAnuncio);
        if (!anuncio) {
            lancarErroRecrutamento(MENSAGEM_ANUNCIO_NAO_ENCONTRADO);
        }
        if (anuncio.status !== STATUS_ANUNCIO_VAGA.ATIVA) {
            lancarErroRecrutamento(MENSAGEM_ANUNCIO_NAO_ATIVO);
        }

        const anuncioPublico = { ...anuncio };
        delete anuncioPublico.criadoPor;
        delete anuncioPublico.criadoPorUserId;
        return anuncioPublico;
    }
}

export default new GetAnuncioVagaPublicoService();
