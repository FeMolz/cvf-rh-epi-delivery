import {
    MENSAGEM_CANDIDATURA_NAO_ENCONTRADA,
    MENSAGEM_IDENTIFICADOR_CANDIDATURA_OBRIGATORIO,
    MENSAGEM_TIPO_VISUALIZACAO_CANDIDATURA_INVALIDO,
    TIPO_VISUALIZACAO_CANDIDATURA
} from '../constants/recrutamentoConstantes.js';
import candidaturaRepository from '../repositories/CandidaturaRepository.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';

class MarcarVisualizacaoCandidaturaService {
    /**
     * @param {string} identificadorCandidatura
     * @param {{ tipo: string }} entrada
     */
    async execute(identificadorCandidatura, entrada) {
        if (!identificadorCandidatura) {
            lancarErroRecrutamento(MENSAGEM_IDENTIFICADOR_CANDIDATURA_OBRIGATORIO);
        }

        const tipo =
            typeof entrada.tipo === 'string' ? entrada.tipo.trim().toUpperCase() : '';

        if (
            tipo !== TIPO_VISUALIZACAO_CANDIDATURA.DESCRICAO &&
            tipo !== TIPO_VISUALIZACAO_CANDIDATURA.CURRICULO
        ) {
            lancarErroRecrutamento(MENSAGEM_TIPO_VISUALIZACAO_CANDIDATURA_INVALIDO);
        }

        const candidatura = await candidaturaRepository.findById(identificadorCandidatura);
        if (!candidatura) {
            lancarErroRecrutamento(MENSAGEM_CANDIDATURA_NAO_ENCONTRADA);
        }

        const campo =
            tipo === TIPO_VISUALIZACAO_CANDIDATURA.DESCRICAO
                ? 'descricaoVisualizadaEm'
                : 'curriculoVisualizadoEm';

        if (candidatura[campo]) {
            return candidatura;
        }

        return candidaturaRepository.update(identificadorCandidatura, {
            [campo]: new Date()
        });
    }
}

export default new MarcarVisualizacaoCandidaturaService();
