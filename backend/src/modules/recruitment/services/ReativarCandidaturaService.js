import {
    MENSAGEM_CANDIDATURA_NAO_ENCONTRADA,
    MENSAGEM_CANDIDATURA_NAO_PODE_REATIVAR,
    MENSAGEM_IDENTIFICADOR_CANDIDATURA_OBRIGATORIO,
    STATUS_CANDIDATURA
} from '../constants/recrutamentoConstantes.js';
import candidaturaRepository from '../repositories/CandidaturaRepository.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';

export const DESTINO_REATIVACAO_CANDIDATURA = {
    CANDIDATURAS: 'CANDIDATURAS',
    REATIVADOS: 'REATIVADOS'
};

class ReativarCandidaturaService {
    /**
     * @param {string} identificadorCandidatura
     */
    async execute(identificadorCandidatura) {
        if (!identificadorCandidatura) {
            lancarErroRecrutamento(MENSAGEM_IDENTIFICADOR_CANDIDATURA_OBRIGATORIO);
        }

        const candidatura = await candidaturaRepository.findById(identificadorCandidatura);
        if (!candidatura) {
            lancarErroRecrutamento(MENSAGEM_CANDIDATURA_NAO_ENCONTRADA);
        }

        if (candidatura.status !== STATUS_CANDIDATURA.DESCARTADO) {
            lancarErroRecrutamento(MENSAGEM_CANDIDATURA_NAO_PODE_REATIVAR);
        }

        const candidaturaAtualizada = await candidaturaRepository.update(identificadorCandidatura, {
            status: STATUS_CANDIDATURA.PENDENTE,
            descartadoEm: null,
            reativadoEm: new Date()
        });

        return {
            candidatura: candidaturaAtualizada,
            destino: DESTINO_REATIVACAO_CANDIDATURA.REATIVADOS
        };
    }
}

export default new ReativarCandidaturaService();
