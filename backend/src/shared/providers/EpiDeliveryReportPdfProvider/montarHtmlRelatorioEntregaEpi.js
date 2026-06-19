import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    MENSAGEM_SEM_ENTREGAS_NO_PERIODO,
    RODAPE_DOCUMENTO_GERADO,
    ROTULO_ASSINATURA_FUNCIONARIO,
    ROTULO_ASSINATURA_RESPONSAVEL_RH,
    ROTULO_CARGO,
    ROTULO_COLUNA_DATA_ENTREGA,
    ROTULO_COLUNA_EQUIPAMENTO,
    ROTULO_COLUNA_NUMERO_CA,
    ROTULO_EMPRESA,
    ROTULO_NOME_FUNCIONARIO,
    ROTULO_PERIODO_REFERENCIA,
    ROTULO_SECAO_ENTREGAS,
    ROTULO_SETOR,
    SUBTITULO_RELATORIO_ENTREGA_EPI,
    TITULO_RELATORIO_ENTREGA_EPI
} from './constants/relatorioEntregaEpiPdfConstantes.js';
import { escaparHtml } from './utils/escaparHtml.js';

const diretorioAtual = dirname(fileURLToPath(import.meta.url));

const caminhoTemplateHtml = join(diretorioAtual, 'templates', 'relatorioEntregaEpi.template.html');
const caminhoTemplateCss = join(diretorioAtual, 'templates', 'relatorioEntregaEpi.template.css');

/**
 * @typedef {{ dataEntrega: string, nomeEquipamento: string, numeroCa: string }} LinhaTabelaEntregaEpi
 */

/**
 * @typedef {object} PayloadRelatorioEntregaEpiHtml
 * @property {string} nomeFuncionario
 * @property {string} nomeEmpresa
 * @property {string} nomeCargo
 * @property {string} nomeSetor
 * @property {string} textoPeriodoReferencia
 * @property {LinhaTabelaEntregaEpi[]} entregasTabela
 */

/**
 * @param {string} modeloHtml
 * @param {Record<string, string>} substituicoes
 * @returns {string}
 */
function aplicarSubstituicoes(modeloHtml, substituicoes) {
    let htmlMontado = modeloHtml;
    for (const [chave, valor] of Object.entries(substituicoes)) {
        htmlMontado = htmlMontado.replaceAll(`{{${chave}}}`, valor);
    }
    return htmlMontado;
}

/**
 * @param {LinhaTabelaEntregaEpi[]} entregasTabela
 * @returns {string}
 */
function montarLinhasTabelaEntregas(entregasTabela) {
    if (!entregasTabela.length) {
        return `<tr><td colspan="3" class="celula-vazia">${escaparHtml(MENSAGEM_SEM_ENTREGAS_NO_PERIODO)}</td></tr>`;
    }

    return entregasTabela
        .map(
            (linha) => `<tr>
        <td>${escaparHtml(linha.dataEntrega)}</td>
        <td>${escaparHtml(linha.nomeEquipamento)}</td>
        <td>${escaparHtml(linha.numeroCa)}</td>
    </tr>`
        )
        .join('\n');
}

/**
 * @param {PayloadRelatorioEntregaEpiHtml} payloadRelatorio
 * @returns {string}
 */
export function montarHtmlRelatorioEntregaEpi(payloadRelatorio) {
    const modeloHtml = readFileSync(caminhoTemplateHtml, 'utf8');
    const estilosCss = readFileSync(caminhoTemplateCss, 'utf8');
    const entregasTabela = Array.isArray(payloadRelatorio.entregasTabela)
        ? payloadRelatorio.entregasTabela
        : [];

    return aplicarSubstituicoes(modeloHtml, {
        TITULO_DOCUMENTO: escaparHtml(TITULO_RELATORIO_ENTREGA_EPI),
        ESTILOS_CSS: estilosCss,
        TITULO_RELATORIO: escaparHtml(TITULO_RELATORIO_ENTREGA_EPI),
        SUBTITULO_RELATORIO: escaparHtml(SUBTITULO_RELATORIO_ENTREGA_EPI),
        ROTULO_PERIODO: escaparHtml(ROTULO_PERIODO_REFERENCIA),
        TEXTO_PERIODO: escaparHtml(payloadRelatorio.textoPeriodoReferencia),
        ROTULO_FUNCIONARIO: escaparHtml(ROTULO_NOME_FUNCIONARIO),
        NOME_FUNCIONARIO: escaparHtml(payloadRelatorio.nomeFuncionario),
        ROTULO_EMPRESA: escaparHtml(ROTULO_EMPRESA),
        NOME_EMPRESA: escaparHtml(payloadRelatorio.nomeEmpresa),
        ROTULO_CARGO: escaparHtml(ROTULO_CARGO),
        NOME_CARGO: escaparHtml(payloadRelatorio.nomeCargo),
        ROTULO_SETOR: escaparHtml(ROTULO_SETOR),
        NOME_SETOR: escaparHtml(payloadRelatorio.nomeSetor),
        ROTULO_SECAO_ENTREGAS: escaparHtml(ROTULO_SECAO_ENTREGAS),
        COLUNA_DATA: escaparHtml(ROTULO_COLUNA_DATA_ENTREGA),
        COLUNA_EQUIPAMENTO: escaparHtml(ROTULO_COLUNA_EQUIPAMENTO),
        COLUNA_CA: escaparHtml(ROTULO_COLUNA_NUMERO_CA),
        LINHAS_TABELA_ENTREGAS: montarLinhasTabelaEntregas(entregasTabela),
        ROTULO_ASSINATURA_FUNCIONARIO: escaparHtml(ROTULO_ASSINATURA_FUNCIONARIO),
        ROTULO_ASSINATURA_RH: escaparHtml(ROTULO_ASSINATURA_RESPONSAVEL_RH),
        TEXTO_RODAPE: escaparHtml(RODAPE_DOCUMENTO_GERADO)
    });
}
