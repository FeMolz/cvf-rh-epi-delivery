import { MENSAGEM_CURRICULO_CONTEUDO_INVALIDO } from '../../../shared/constants/segurancaConstantes.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';

/**
 * @param {Buffer} buffer
 * @returns {boolean}
 */
function iniciaComAssinatura(buffer, assinaturaBytes) {
    if (buffer.length < assinaturaBytes.length) {
        return false;
    }

    return assinaturaBytes.every((byte, indice) => buffer[indice] === byte);
}

/**
 * @param {Buffer} buffer
 * @param {string} nomeArquivo
 */
export function validarAssinaturaArquivoCurriculo(buffer, nomeArquivo) {
    const nomeMinusculo = String(nomeArquivo ?? '').toLowerCase();

    if (nomeMinusculo.endsWith('.pdf')) {
        if (!iniciaComAssinatura(buffer, Buffer.from('%PDF'))) {
            lancarErroRecrutamento(MENSAGEM_CURRICULO_CONTEUDO_INVALIDO);
        }
        return;
    }

    if (nomeMinusculo.endsWith('.doc')) {
        if (!iniciaComAssinatura(buffer, Buffer.from([0xd0, 0xcf, 0x11, 0xe0]))) {
            lancarErroRecrutamento(MENSAGEM_CURRICULO_CONTEUDO_INVALIDO);
        }
        return;
    }

    if (nomeMinusculo.endsWith('.docx') || nomeMinusculo.endsWith('.odt')) {
        if (!iniciaComAssinatura(buffer, Buffer.from([0x50, 0x4b, 0x03, 0x04]))) {
            lancarErroRecrutamento(MENSAGEM_CURRICULO_CONTEUDO_INVALIDO);
        }
        return;
    }

    if (nomeMinusculo.endsWith('.rtf')) {
        const prefixoTexto = buffer.subarray(0, 5).toString('utf8').toLowerCase();
        if (!prefixoTexto.startsWith('{\\rtf')) {
            lancarErroRecrutamento(MENSAGEM_CURRICULO_CONTEUDO_INVALIDO);
        }
    }
}
