import { MENSAGEM_ANUNCIO_NAO_ENCONTRADO } from '../constants/recrutamentoConstantes.js';
import anuncioVagaRepository from '../repositories/AnuncioVagaRepository.js';
import candidaturaRepository from '../repositories/CandidaturaRepository.js';
import { validarPeriodoFiltroCandidaturas } from '../utils/validarPeriodoFiltroCandidaturas.js';

class ListCandidaturasService {
    /**
     * @param {string} identificadorAnuncio
     * @param {{ dataInicio?: string, dataFim?: string }} filtros
     */
    async execute(identificadorAnuncio, filtros = {}) {
        const anuncio = await anuncioVagaRepository.findById(identificadorAnuncio);
        if (!anuncio) {
            throw new Error(MENSAGEM_ANUNCIO_NAO_ENCONTRADO);
        }

        const periodo = validarPeriodoFiltroCandidaturas(filtros);
        const candidaturas = await candidaturaRepository.findManyByAnuncio(identificadorAnuncio, periodo);
        const totalCandidaturas = await candidaturaRepository.countByAnuncio(identificadorAnuncio);

        return {
            anuncio: { id: anuncio.id, tituloVaga: anuncio.tituloVaga, status: anuncio.status },
            totalCandidaturas,
            totalFiltrado: candidaturas.length,
            candidaturas
        };
    }
}

export default new ListCandidaturasService();
