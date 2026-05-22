import { STATUS_ANUNCIO_VAGA } from '../constants/recrutamentoConstantes.js';
import anuncioVagaRepository from '../repositories/AnuncioVagaRepository.js';
import { normalizarCamposAnuncioVaga } from '../utils/normalizarCamposAnuncioVaga.js';

class CreateAnuncioVagaService {
    /**
     * @param {object} entrada
     * @param {string} entrada.criadoPorUserId
     */
    async execute(entrada) {
        const campos = normalizarCamposAnuncioVaga(entrada, { obrigatorio: true });

        return anuncioVagaRepository.create({
            ...campos,
            tipoContratacao: campos.tipoContratacao,
            status: STATUS_ANUNCIO_VAGA.INATIVA,
            criadoPorUserId: entrada.criadoPorUserId
        });
    }
}

export default new CreateAnuncioVagaService();
