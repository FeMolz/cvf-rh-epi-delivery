import { DIAS_RETENCAO_CANDIDATURA_DESCARTADA } from '../constants/recrutamentoConstantes.js';
import candidaturaRepository from '../repositories/CandidaturaRepository.js';

class LimparCandidaturasDescartadasService {
    async execute() {
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - DIAS_RETENCAO_CANDIDATURA_DESCARTADA);

        return candidaturaRepository.deleteManyDescartadasAntigas(dataLimite);
    }
}

export default new LimparCandidaturasDescartadasService();
