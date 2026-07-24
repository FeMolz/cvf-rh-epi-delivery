import {
    MENSAGEM_CANDIDATURA_NAO_ENCONTRADA,
    MENSAGEM_IDENTIFICADOR_CANDIDATURA_OBRIGATORIO,
    MENSAGEM_STATUS_CANDIDATURA_INVALIDO,
    MENSAGEM_STATUS_CANDIDATURA_NAO_ALTERAVEL,
    STATUS_CANDIDATURA
} from '../constants/recrutamentoConstantes.js';
import candidaturaRepository from '../repositories/CandidaturaRepository.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';

const STATUS_PERMITIDOS_ADMIN = new Set([
    STATUS_CANDIDATURA.PROXIMA_FASE,
    STATUS_CANDIDATURA.DESCARTADO
]);

class AtualizarStatusCandidaturaService {
    /**
     * @param {string} identificadorCandidatura
     * @param {{ status: string }} entrada
     */
    async execute(identificadorCandidatura, entrada) {
        if (!identificadorCandidatura) {
            lancarErroRecrutamento(MENSAGEM_IDENTIFICADOR_CANDIDATURA_OBRIGATORIO);
        }

        const novoStatus =
            typeof entrada.status === 'string' ? entrada.status.trim().toUpperCase() : '';

        if (!STATUS_PERMITIDOS_ADMIN.has(novoStatus)) {
            lancarErroRecrutamento(MENSAGEM_STATUS_CANDIDATURA_INVALIDO);
        }

        const candidatura = await candidaturaRepository.findById(identificadorCandidatura);
        if (!candidatura) {
            lancarErroRecrutamento(MENSAGEM_CANDIDATURA_NAO_ENCONTRADA);
        }

        if (
            candidatura.status !== STATUS_CANDIDATURA.PENDENTE &&
            candidatura.status !== STATUS_CANDIDATURA.PROXIMA_FASE
        ) {
            lancarErroRecrutamento(MENSAGEM_STATUS_CANDIDATURA_NAO_ALTERAVEL);
        }

        const dadosAtualizacao = { status: novoStatus };

        if (novoStatus === STATUS_CANDIDATURA.DESCARTADO) {
            dadosAtualizacao.descartadoEm = new Date();
        } else {
            dadosAtualizacao.descartadoEm = null;
        }

        return candidaturaRepository.update(identificadorCandidatura, dadosAtualizacao);
    }
}

export default new AtualizarStatusCandidaturaService();
