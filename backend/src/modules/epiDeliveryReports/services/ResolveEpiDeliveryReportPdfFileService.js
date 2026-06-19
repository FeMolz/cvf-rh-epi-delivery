import {
    MENSAGEM_ARQUIVO_PDF_AUSENTE,
    MENSAGEM_IDENTIFICADOR_RELATORIO_OBRIGATORIO,
    MENSAGEM_RELATORIO_NAO_ENCONTRADO
} from '../constants/relatorioEntregaEpiConstantes.js';
import epiDeliveryReportRepository from '../repositories/EpiDeliveryReportRepository.js';

/**
 * Remove caracteres inválidos em nomes de arquivo e substitui espaços por sublinhado.
 * @param {string} nomeBruto
 * @returns {string}
 */
function sanitizarNomeFuncionarioParaArquivo(nomeBruto) {
    if (!nomeBruto || typeof nomeBruto !== 'string') {
        return 'funcionario';
    }
    const texto = nomeBruto
        .trim()
        .replace(/[<>:"/\\|?*]/g, '')
        .replace(/\p{Cc}/gu, '')
        .replace(/\.+$/g, '')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
    const truncado = texto.slice(0, 120);
    return truncado.length > 0 ? truncado : 'funcionario';
}

/**
 * Data de emissão (UTC) no formato AAAA-MM-DD para o nome do arquivo.
 * @param {Date | string | null | undefined} dataEmissao
 * @returns {string}
 */
function formatarDataEmissaoUtcParaNomeArquivo(dataEmissao) {
    if (!dataEmissao) {
        return 'data-desconhecida';
    }
    const instante = dataEmissao instanceof Date ? dataEmissao : new Date(dataEmissao);
    if (Number.isNaN(instante.getTime())) {
        return 'data-desconhecida';
    }
    const ano = instante.getUTCFullYear();
    const mes = String(instante.getUTCMonth() + 1).padStart(2, '0');
    const dia = String(instante.getUTCDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

/**
 * @param {Buffer | Uint8Array | null | undefined} pdfConteudo
 * @returns {Buffer}
 */
function normalizarBufferPdf(pdfConteudo) {
    if (!pdfConteudo) {
        return Buffer.alloc(0);
    }
    if (Buffer.isBuffer(pdfConteudo)) {
        return pdfConteudo;
    }
    return Buffer.from(pdfConteudo);
}

class ResolveEpiDeliveryReportPdfFileService {
    /**
     * @param {string} identificadorRelatorio
     * @returns {Promise<{ bufferPdf: Buffer, nomeArquivoSugerido: string }>}
     */
    async execute(identificadorRelatorio) {
        if (!identificadorRelatorio) {
            throw new Error(MENSAGEM_IDENTIFICADOR_RELATORIO_OBRIGATORIO);
        }

        const relatorioPersistido = await epiDeliveryReportRepository.findByIdComPdfBinarioParaDownload(
            identificadorRelatorio
        );

        if (!relatorioPersistido) {
            throw new Error(MENSAGEM_RELATORIO_NAO_ENCONTRADO);
        }

        const bufferPdf = normalizarBufferPdf(relatorioPersistido.pdfConteudo);
        if (bufferPdf.length === 0) {
            throw new Error(MENSAGEM_ARQUIVO_PDF_AUSENTE);
        }

        const nomeFuncionarioParaArquivo = sanitizarNomeFuncionarioParaArquivo(relatorioPersistido.employee.name);
        const instanteEmissao = relatorioPersistido.createdAt ?? relatorioPersistido.updatedAt;
        const dataEmissaoParaArquivo = formatarDataEmissaoUtcParaNomeArquivo(instanteEmissao);
        const nomeArquivoSugerido = `${nomeFuncionarioParaArquivo}_${dataEmissaoParaArquivo}.pdf`;

        return { bufferPdf, nomeArquivoSugerido };
    }
}

export default new ResolveEpiDeliveryReportPdfFileService();
