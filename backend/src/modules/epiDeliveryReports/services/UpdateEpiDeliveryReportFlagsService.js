import {
    MENSAGEM_FLAGS_OBRIGATORIAS,
    MENSAGEM_IDENTIFICADOR_RELATORIO_OBRIGATORIO,
    MENSAGEM_RELATORIO_NAO_ENCONTRADO
} from '../constants/relatorioEntregaEpiConstantes.js';
import epiDeliveryReportRepository from '../repositories/EpiDeliveryReportRepository.js';

class UpdateEpiDeliveryReportFlagsService {
    /**
     * @param {string} identificadorRelatorio
     * @param {{ foiImpresso?: boolean, foiEncaminhado?: boolean, foiAssinado?: boolean }} indicadores
     */
    async execute(identificadorRelatorio, indicadores) {
        if (!identificadorRelatorio) {
            throw new Error(MENSAGEM_IDENTIFICADOR_RELATORIO_OBRIGATORIO);
        }

        const existente = await epiDeliveryReportRepository.findById(identificadorRelatorio);
        if (!existente) {
            throw new Error(MENSAGEM_RELATORIO_NAO_ENCONTRADO);
        }

        const dadosAtualizacao = {};

        if (typeof indicadores.foiImpresso === 'boolean') {
            dadosAtualizacao.foiImpresso = indicadores.foiImpresso;
        }
        if (typeof indicadores.foiEncaminhado === 'boolean') {
            dadosAtualizacao.foiEncaminhado = indicadores.foiEncaminhado;
        }
        if (typeof indicadores.foiAssinado === 'boolean') {
            dadosAtualizacao.foiAssinado = indicadores.foiAssinado;
        }

        if (Object.keys(dadosAtualizacao).length === 0) {
            throw new Error(MENSAGEM_FLAGS_OBRIGATORIAS);
        }

        return epiDeliveryReportRepository.updateFlagsById(identificadorRelatorio, dadosAtualizacao);
    }
}

export default new UpdateEpiDeliveryReportFlagsService();
