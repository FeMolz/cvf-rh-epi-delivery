import {
    MENSAGEM_CANDIDATURA_NAO_ENCONTRADA,
    MENSAGEM_CURRICULO_AUSENTE
} from '../constants/recrutamentoConstantes.js';
import candidaturaRepository from '../repositories/CandidaturaRepository.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';
import {
    registrarEventoAuditoria,
    TIPOS_EVENTO_AUDITORIA
} from '../../../shared/utils/registrarEventoAuditoria.js';

class DownloadCurriculoCandidaturaService {
    /**
     * @param {string} identificadorCandidatura
     * @param {{ identificadorUsuario?: string, papelUsuario?: string }} [contextoAuditoria]
     */
    async execute(identificadorCandidatura, contextoAuditoria = {}) {
        const candidatura = await candidaturaRepository.findByIdComCurriculo(identificadorCandidatura);
        if (!candidatura) {
            lancarErroRecrutamento(MENSAGEM_CANDIDATURA_NAO_ENCONTRADA);
        }
        if (!candidatura.curriculoConteudo) {
            lancarErroRecrutamento(MENSAGEM_CURRICULO_AUSENTE);
        }

        registrarEventoAuditoria(TIPOS_EVENTO_AUDITORIA.DOWNLOAD_CURRICULO, {
            identificadorCandidatura,
            identificadorUsuario: contextoAuditoria.identificadorUsuario,
            papelUsuario: contextoAuditoria.papelUsuario
        });

        return {
            bufferCurriculo: Buffer.from(candidatura.curriculoConteudo),
            nomeArquivo: candidatura.curriculoNomeArquivo,
            tipoMime: candidatura.curriculoTipoMime
        };
    }
}

export default new DownloadCurriculoCandidaturaService();
