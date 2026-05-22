import { MENSAGEM_CANDIDATURA_NAO_ENCONTRADA } from '../constants/recrutamentoConstantes.js';
import candidaturaRepository from '../repositories/CandidaturaRepository.js';

class GetCandidaturaService {
    /**
     * @param {string} identificadorCandidatura
     */
    async execute(identificadorCandidatura) {
        const candidatura = await candidaturaRepository.findById(identificadorCandidatura);
        if (!candidatura) {
            throw new Error(MENSAGEM_CANDIDATURA_NAO_ENCONTRADA);
        }
        return candidatura;
    }
}

export default new GetCandidaturaService();
