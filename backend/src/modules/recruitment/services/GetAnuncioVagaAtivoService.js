import {
    MENSAGEM_ANUNCIO_NAO_ATIVO,
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    STATUS_ANUNCIO_VAGA
} from '../constants/recrutamentoConstantes.js';
import anuncioVagaRepository from '../repositories/AnuncioVagaRepository.js';
import candidaturaRepository from '../repositories/CandidaturaRepository.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';

class GetAnuncioVagaAtivoService {
    /**
     * @param {string} identificadorAnuncio
     * @param {string} [identificadorUsuario]
     */
    async execute(identificadorAnuncio, identificadorUsuario) {
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

        let jaCandidatou = false;
        if (identificadorUsuario) {
            const candidaturaExistente = await candidaturaRepository.findByAnuncioAndUser(
                identificadorAnuncio,
                identificadorUsuario
            );
            jaCandidatou = Boolean(candidaturaExistente);
        }

        return { ...anuncioPublico, jaCandidatou };
    }
}

export default new GetAnuncioVagaAtivoService();
