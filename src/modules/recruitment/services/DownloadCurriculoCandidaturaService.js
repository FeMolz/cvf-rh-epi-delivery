import {
    MENSAGEM_CANDIDATURA_NAO_ENCONTRADA,
    MENSAGEM_CURRICULO_AUSENTE
} from '../constants/recrutamentoConstantes.js';
import candidaturaRepository from '../repositories/CandidaturaRepository.js';

class DownloadCurriculoCandidaturaService {
    /**
     * @param {string} identificadorCandidatura
     */
    async execute(identificadorCandidatura) {
        const candidatura = await candidaturaRepository.findByIdComCurriculo(identificadorCandidatura);
        if (!candidatura) {
            throw new Error(MENSAGEM_CANDIDATURA_NAO_ENCONTRADA);
        }
        if (!candidatura.curriculoConteudo) {
            throw new Error(MENSAGEM_CURRICULO_AUSENTE);
        }

        return {
            bufferCurriculo: Buffer.from(candidatura.curriculoConteudo),
            nomeArquivo: candidatura.curriculoNomeArquivo,
            tipoMime: candidatura.curriculoTipoMime
        };
    }
}

export default new DownloadCurriculoCandidaturaService();
