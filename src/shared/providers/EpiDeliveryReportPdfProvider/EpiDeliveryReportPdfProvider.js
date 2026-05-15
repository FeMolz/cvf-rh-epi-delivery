import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const TITULO_PRINCIPAL = 'Relatório de entregas de EPI';
const SUBTITULO_CABECALHO = 'Equipamentos de proteção individual — período consolidado';
const ROTULO_PERIODO = 'Período de referência';
const ROTULO_FUNCIONARIO = 'Funcionário';
const ROTULO_CPF = 'CPF';
const ROTULO_CARGO = 'Cargo';
const ROTULO_EMPRESA = 'Empresa';
const ROTULO_SECAO_ENTREGAS = 'Entregas registradas no período';
const ROTULO_COL_DATA = 'Data da entrega';
const ROTULO_COL_EQUIPAMENTO = 'Equipamento';
const ROTULO_COL_CA = 'Número do CA';
const ROTULO_SEM_ENTREGAS = 'Nenhuma entrega registrada neste intervalo.';
const ROTULO_ASSINATURA_FUNCIONARIO = 'Assinatura do funcionário';
const ROTULO_ASSINATURA_RH = 'Assinatura do RH / SST';
const RODAPE_SISTEMA = 'Documento gerado eletronicamente — RH-System';

const LARGURA_PAGINA = 595.28;
const ALTURA_PAGINA = 841.89;
const MARGEM_LATERAL = 48;
const MARGEM_INFERIOR_MINIMA = 52;
const ALTURA_FAIXA_SUPERIOR = 92;
const ALTURA_RESERVADA_ASSINATURAS = 200;

const COR_AZUL_TOPO = rgb(0.07, 0.28, 0.45);
const COR_AZUL_ACENTO = rgb(0.12, 0.45, 0.68);
const COR_TEXTO = rgb(0.12, 0.14, 0.16);
const COR_TEXTO_SECUNDARIO = rgb(0.38, 0.4, 0.44);
const COR_BRANCO = rgb(1, 1, 1);
const COR_FUNDO_INFO = rgb(0.96, 0.97, 0.98);
const COR_BORDA = rgb(0.78, 0.81, 0.85);
const COR_CABECALHO_TABELA = rgb(0.88, 0.91, 0.95);
const COR_ZEBRA = rgb(0.99, 0.995, 1);

/**
 * @param {string} texto
 * @param {import('pdf-lib').PDFFont} fonte
 * @param {number} tamanhoFonte
 * @param {number} larguraMaximaPontos
 * @returns {string[]}
 */
function quebrarTextoEmLinhas(texto, fonte, tamanhoFonte, larguraMaximaPontos) {
    const fragmentos = String(texto).split(/\s+/).filter((f) => f.length > 0);
    const linhas = [];
    let atual = '';

    for (const frag of fragmentos) {
        const candidato = atual ? `${atual} ${frag}` : frag;
        if (fonte.widthOfTextAtSize(candidato, tamanhoFonte) <= larguraMaximaPontos) {
            atual = candidato;
        } else {
            if (atual) linhas.push(atual);
            atual = frag;
        }
    }
    if (atual) linhas.push(atual);
    return linhas.length > 0 ? linhas : [''];
}

/**
 * @typedef {{ dataEntrega: string, nomeEquipamento: string, numeroCa: string }} LinhaTabelaEntregaEpi
 */

/**
 * @typedef {object} PayloadRelatorioEntregaEpiPdf
 * @property {string} nomeFuncionario
 * @property {string} cpfFuncionario
 * @property {string} nomeCargo
 * @property {string} nomeEmpresa
 * @property {string} textoPeriodoReferencia
 * @property {LinhaTabelaEntregaEpi[]} entregasTabela
 */

/**
 * @typedef {object} ContextoPdf
 * @property {import('pdf-lib').PDFDocument} documento
 * @property {import('pdf-lib').PDFPage} pagina
 * @property {number} cursorY
 * @property {import('pdf-lib').PDFFont} fonteRegular
 * @property {import('pdf-lib').PDFFont} fonteNegrito
 */

/**
 * @param {ContextoPdf} ctx
 * @param {number} alturaNecessaria
 */
function garantirEspacoVertical(ctx, alturaNecessaria) {
    if (ctx.cursorY - alturaNecessaria >= MARGEM_INFERIOR_MINIMA + ALTURA_RESERVADA_ASSINATURAS) {
        return;
    }
    ctx.pagina = ctx.documento.addPage([LARGURA_PAGINA, ALTURA_PAGINA]);
    ctx.cursorY = ALTURA_PAGINA - MARGEM_LATERAL;
}

/**
 * @param {ContextoPdf} ctx
 * @param {number} yBaseTopo
 */
function desenharFaixaSuperior(ctx, yBaseTopo) {
    ctx.pagina.drawRectangle({
        x: 0,
        y: yBaseTopo - ALTURA_FAIXA_SUPERIOR,
        width: LARGURA_PAGINA,
        height: ALTURA_FAIXA_SUPERIOR,
        color: COR_AZUL_TOPO
    });
    ctx.pagina.drawRectangle({
        x: 0,
        y: yBaseTopo - 4,
        width: LARGURA_PAGINA,
        height: 4,
        color: COR_AZUL_ACENTO
    });

    ctx.pagina.drawText(TITULO_PRINCIPAL.toUpperCase(), {
        x: MARGEM_LATERAL,
        y: yBaseTopo - 44,
        size: 16,
        font: ctx.fonteNegrito,
        color: COR_BRANCO
    });
    ctx.pagina.drawText(SUBTITULO_CABECALHO, {
        x: MARGEM_LATERAL,
        y: yBaseTopo - 64,
        size: 9,
        font: ctx.fonteRegular,
        color: rgb(0.88, 0.92, 0.96)
    });
}

/**
 * @param {ContextoPdf} ctx
 * @param {string} rotulo
 * @param {string} valor
 * @param {number} larguraRotulo
 */
function desenharLinhaInfo(ctx, rotulo, valor, larguraRotulo) {
    const tamanho = 10;
    const posicaoXRotulo = MARGEM_LATERAL + 12;
    const posicaoXValor = MARGEM_LATERAL + larguraRotulo;
    const larguraValor =
        LARGURA_PAGINA - 2 * MARGEM_LATERAL - larguraRotulo - 20;
    const linhaBase = ctx.cursorY;

    ctx.pagina.drawText(rotulo, {
        x: posicaoXRotulo,
        y: linhaBase,
        size: tamanho,
        font: ctx.fonteNegrito,
        color: COR_TEXTO_SECUNDARIO
    });

    const linhasValor = quebrarTextoEmLinhas(valor, ctx.fonteRegular, tamanho, larguraValor);
    let posicaoYValor = linhaBase;
    for (const trecho of linhasValor) {
        ctx.pagina.drawText(trecho, {
            x: posicaoXValor,
            y: posicaoYValor,
            size: tamanho,
            font: ctx.fonteRegular,
            color: COR_TEXTO
        });
        posicaoYValor -= 12;
    }

    const posicaoYValorAposUltimaLinha = posicaoYValor;
    ctx.cursorY = posicaoYValorAposUltimaLinha - 8;
}

/**
 * @param {ContextoPdf} ctx
 * @param {PayloadRelatorioEntregaEpiPdf} payload
 */
function desenharBlocoIdentificacao(ctx, payload) {
    const larguraCaixa = LARGURA_PAGINA - 2 * MARGEM_LATERAL;
    const alturaCaixa = 132;
    garantirEspacoVertical(ctx, alturaCaixa + 16);

    const yTopoConteudo = ctx.cursorY;
    const yBaseCaixa = yTopoConteudo - alturaCaixa;

    ctx.pagina.drawRectangle({
        x: MARGEM_LATERAL,
        y: yBaseCaixa,
        width: larguraCaixa,
        height: alturaCaixa,
        color: COR_FUNDO_INFO,
        borderColor: COR_BORDA,
        borderWidth: 0.75
    });

    ctx.cursorY = yTopoConteudo - 14;
    desenharLinhaInfo(ctx, `${ROTULO_PERIODO}:`, payload.textoPeriodoReferencia, 122);
    desenharLinhaInfo(ctx, `${ROTULO_FUNCIONARIO}:`, payload.nomeFuncionario, 122);
    desenharLinhaInfo(ctx, `${ROTULO_CPF}:`, payload.cpfFuncionario, 122);
    desenharLinhaInfo(ctx, `${ROTULO_CARGO}:`, payload.nomeCargo, 122);
    desenharLinhaInfo(ctx, `${ROTULO_EMPRESA}:`, payload.nomeEmpresa, 122);

    ctx.cursorY = yBaseCaixa - 10;
}

/**
 * @param {ContextoPdf} ctx
 * @param {number} yTopoLinha
 * @param {number} alturaLinha
 * @param {string[]} textosColunas
 * @param {number[]} largurasColunas
 * @param {{ negrito: boolean, corFundo?: import('pdf-lib').RGB }} estilo
 */
function desenharLinhaTabela(ctx, yTopoLinha, alturaLinha, textosColunas, largurasColunas, estilo) {
    const xInicio = MARGEM_LATERAL;
    const larguraTotal = largurasColunas.reduce((acc, w) => acc + w, 0);
    const yBase = yTopoLinha - alturaLinha;

    if (estilo.corFundo) {
        ctx.pagina.drawRectangle({
            x: xInicio,
            y: yBase,
            width: larguraTotal,
            height: alturaLinha,
            color: estilo.corFundo
        });
    }

    ctx.pagina.drawRectangle({
        x: xInicio,
        y: yBase,
        width: larguraTotal,
        height: alturaLinha,
        borderColor: COR_BORDA,
        borderWidth: 0.45
    });

    let xCursor = xInicio + 8;
    const fonte = estilo.negrito ? ctx.fonteNegrito : ctx.fonteRegular;
    const tamanhoFonte = 9;
    const primeiraLinhaBase = yTopoLinha - 14;

    for (let coluna = 0; coluna < textosColunas.length; coluna += 1) {
        const larguraUtilCelula = largurasColunas[coluna] - 14;
        const linhasCelula = quebrarTextoEmLinhas(textosColunas[coluna], fonte, tamanhoFonte, larguraUtilCelula);
        const maxLinhas = estilo.negrito ? 1 : 5;
        const linhasVisiveis = linhasCelula.slice(0, maxLinhas);
        let posicaoY = primeiraLinhaBase;
        for (const linha of linhasVisiveis) {
            ctx.pagina.drawText(linha, {
                x: xCursor,
                y: posicaoY,
                size: tamanhoFonte,
                font: fonte,
                color: COR_TEXTO
            });
            posicaoY -= 11;
        }
        xCursor += largurasColunas[coluna];
    }

    let posicaoXDivisoria = xInicio + largurasColunas[0];
    ctx.pagina.drawLine({
        start: { x: posicaoXDivisoria, y: yBase },
        end: { x: posicaoXDivisoria, y: yTopoLinha },
        thickness: 0.35,
        color: COR_BORDA
    });
    posicaoXDivisoria += largurasColunas[1];
    ctx.pagina.drawLine({
        start: { x: posicaoXDivisoria, y: yBase },
        end: { x: posicaoXDivisoria, y: yTopoLinha },
        thickness: 0.35,
        color: COR_BORDA
    });
}

/**
 * @param {ContextoPdf} ctx
 * @param {LinhaTabelaEntregaEpi[]} entregasTabela
 */
function desenharTabelaEntregas(ctx, entregasTabela) {
    const larguraTotal = LARGURA_PAGINA - 2 * MARGEM_LATERAL;
    const larguraData = 86;
    const larguraCa = 88;
    const larguraEquipamento = larguraTotal - larguraData - larguraCa;
    const larguras = [larguraData, larguraEquipamento, larguraCa];

    ctx.cursorY -= 6;
    ctx.pagina.drawText(ROTULO_SECAO_ENTREGAS, {
        x: MARGEM_LATERAL,
        y: ctx.cursorY,
        size: 11,
        font: ctx.fonteNegrito,
        color: COR_TEXTO
    });
    ctx.cursorY -= 22;

    if (entregasTabela.length === 0) {
        garantirEspacoVertical(ctx, 36);
        ctx.pagina.drawText(ROTULO_SEM_ENTREGAS, {
            x: MARGEM_LATERAL,
            y: ctx.cursorY,
            size: 10,
            font: ctx.fonteRegular,
            color: COR_TEXTO_SECUNDARIO
        });
        ctx.cursorY -= 28;
        return;
    }

    const desenharCabecalhoTabela = () => {
        const alturaCabecalho = 26;
        garantirEspacoVertical(ctx, alturaCabecalho + 8);
        desenharLinhaTabela(
            ctx,
            ctx.cursorY,
            alturaCabecalho,
            [ROTULO_COL_DATA, ROTULO_COL_EQUIPAMENTO, ROTULO_COL_CA],
            larguras,
            { negrito: true, corFundo: COR_CABECALHO_TABELA }
        );
        ctx.cursorY -= alturaCabecalho;
    };

    desenharCabecalhoTabela();

    for (let indice = 0; indice < entregasTabela.length; indice += 1) {
        const linha = entregasTabela[indice];
        const linhasEquip = quebrarTextoEmLinhas(
            linha.nomeEquipamento,
            ctx.fonteRegular,
            9,
            larguraEquipamento - 16
        );
        const linhasData = quebrarTextoEmLinhas(linha.dataEntrega, ctx.fonteRegular, 9, larguraData - 16);
        const linhasCa = quebrarTextoEmLinhas(linha.numeroCa, ctx.fonteRegular, 9, larguraCa - 16);
        const alturaLinha = Math.max(26, 10 + Math.max(linhasEquip.length, linhasData.length, linhasCa.length) * 11);

        if (ctx.cursorY - alturaLinha < MARGEM_INFERIOR_MINIMA + ALTURA_RESERVADA_ASSINATURAS) {
            ctx.pagina = ctx.documento.addPage([LARGURA_PAGINA, ALTURA_PAGINA]);
            ctx.cursorY = ALTURA_PAGINA - MARGEM_LATERAL;
            desenharCabecalhoTabela();
        }

        const corZebra = indice % 2 === 0 ? COR_ZEBRA : rgb(1, 1, 1);
        desenharLinhaTabela(
            ctx,
            ctx.cursorY,
            alturaLinha,
            [linha.dataEntrega, linha.nomeEquipamento, linha.numeroCa],
            larguras,
            { negrito: false, corFundo: corZebra }
        );
        ctx.cursorY -= alturaLinha;
    }
}

/**
 * @param {ContextoPdf} ctx
 */
function desenharAssinaturas(ctx) {
    const deslocamentoAcimaDaLinhaAssinatura = 36;
    let posicaoYLinhaAssinatura = ctx.cursorY - deslocamentoAcimaDaLinhaAssinatura;
    const posicaoYMinimaSegura = MARGEM_INFERIOR_MINIMA + 168;
    if (posicaoYLinhaAssinatura < posicaoYMinimaSegura) {
        ctx.pagina = ctx.documento.addPage([LARGURA_PAGINA, ALTURA_PAGINA]);
        posicaoYLinhaAssinatura = posicaoYMinimaSegura;
    }

    const larguraLinha = 220;
    const gap = 56;

    ctx.pagina.drawLine({
        start: { x: MARGEM_LATERAL, y: posicaoYLinhaAssinatura },
        end: { x: MARGEM_LATERAL + larguraLinha, y: posicaoYLinhaAssinatura },
        thickness: 0.8,
        color: COR_TEXTO
    });
    ctx.pagina.drawLine({
        start: { x: MARGEM_LATERAL + larguraLinha + gap, y: posicaoYLinhaAssinatura },
        end: { x: MARGEM_LATERAL + 2 * larguraLinha + gap, y: posicaoYLinhaAssinatura },
        thickness: 0.8,
        color: COR_TEXTO
    });

    ctx.pagina.drawText(ROTULO_ASSINATURA_FUNCIONARIO, {
        x: MARGEM_LATERAL,
        y: posicaoYLinhaAssinatura - 14,
        size: 8.5,
        font: ctx.fonteRegular,
        color: COR_TEXTO_SECUNDARIO
    });
    ctx.pagina.drawText(ROTULO_ASSINATURA_RH, {
        x: MARGEM_LATERAL + larguraLinha + gap,
        y: posicaoYLinhaAssinatura - 14,
        size: 8.5,
        font: ctx.fonteRegular,
        color: COR_TEXTO_SECUNDARIO
    });

    ctx.pagina.drawText(RODAPE_SISTEMA, {
        x: MARGEM_LATERAL,
        y: MARGEM_INFERIOR_MINIMA,
        size: 7.5,
        font: ctx.fonteRegular,
        color: COR_TEXTO_SECUNDARIO
    });
}

class EpiDeliveryReportPdfProvider {
    /**
     * @param {PayloadRelatorioEntregaEpiPdf} payloadRelatorio
     * @returns {Promise<Buffer>}
     */
    async gerarBufferPdf(payloadRelatorio) {
        const documentoPdf = await PDFDocument.create();
        const fonteRegular = await documentoPdf.embedFont(StandardFonts.Helvetica);
        const fonteNegrito = await documentoPdf.embedFont(StandardFonts.HelveticaBold);

        let pagina = documentoPdf.addPage([LARGURA_PAGINA, ALTURA_PAGINA]);

        /** @type {ContextoPdf} */
        const ctx = {
            documento: documentoPdf,
            pagina,
            cursorY: ALTURA_PAGINA - MARGEM_LATERAL,
            fonteRegular,
            fonteNegrito
        };

        desenharFaixaSuperior(ctx, ALTURA_PAGINA);
        ctx.cursorY = ALTURA_PAGINA - ALTURA_FAIXA_SUPERIOR - MARGEM_LATERAL + 8;

        desenharBlocoIdentificacao(ctx, payloadRelatorio);
        const entregasTabela = Array.isArray(payloadRelatorio.entregasTabela) ? payloadRelatorio.entregasTabela : [];
        desenharTabelaEntregas(ctx, entregasTabela);
        desenharAssinaturas(ctx);

        const bytesPdf = await documentoPdf.save();
        return Buffer.from(bytesPdf);
    }
}

export default new EpiDeliveryReportPdfProvider();
