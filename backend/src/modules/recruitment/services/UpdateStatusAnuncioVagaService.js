import {
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    MENSAGEM_STATUS_ANUNCIO_INVALIDO,
    STATUS_ANUNCIO_VAGA
} from '../constants/recrutamentoConstantes.js';
import anuncioVagaRepository from '../repositories/AnuncioVagaRepository.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';

class UpdateStatusAnuncioVagaService {
    /**
     * @param {string} identificadorAnuncio
     * @param {{ status: string }} entrada
     */
    async execute(identificadorAnuncio, entrada) {
        const status = typeof entrada.status === 'string' ? entrada.status.trim().toUpperCase() : '';

        if (!Object.values(STATUS_ANUNCIO_VAGA).includes(status)) {
            lancarErroRecrutamento(MENSAGEM_STATUS_ANUNCIO_INVALIDO);
        }

        const anuncioExistente = await anuncioVagaRepository.findById(identificadorAnuncio);
        if (!anuncioExistente) {
            lancarErroRecrutamento(MENSAGEM_ANUNCIO_NAO_ENCONTRADO);
        }

        return anuncioVagaRepository.update(identificadorAnuncio, { status });
    }
}

export default new UpdateStatusAnuncioVagaService();
