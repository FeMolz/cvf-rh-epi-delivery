import { montarHtmlRelatorioEntregaEpi } from './montarHtmlRelatorioEntregaEpi.js';
import { renderizarHtmlParaPdf } from './renderizarHtmlParaPdf.js';

/**
 * @typedef {{ dataEntrega: string, nomeEquipamento: string, numeroCa: string }} LinhaTabelaEntregaEpi
 */

/**
 * @typedef {object} PayloadRelatorioEntregaEpiPdf
 * @property {string} nomeFuncionario
 * @property {string} nomeEmpresa
 * @property {string} nomeCargo
 * @property {string} nomeSetor
 * @property {string} textoPeriodoReferencia
 * @property {LinhaTabelaEntregaEpi[]} entregasTabela
 */

class EpiDeliveryReportPdfProvider {
    /**
     * @param {PayloadRelatorioEntregaEpiPdf} payloadRelatorio
     * @returns {Promise<Buffer>}
     */
    async gerarBufferPdf(payloadRelatorio) {
        const htmlRelatorio = montarHtmlRelatorioEntregaEpi(payloadRelatorio);
        return renderizarHtmlParaPdf(htmlRelatorio);
    }
}

export default new EpiDeliveryReportPdfProvider();
