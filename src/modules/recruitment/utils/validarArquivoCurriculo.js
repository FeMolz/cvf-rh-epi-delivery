import {
    EXTENSOES_CURRICULO_PERMITIDAS,
    MENSAGEM_CURRICULO_OBRIGATORIO,
    MENSAGEM_CURRICULO_TAMANHO_EXCEDIDO,
    MENSAGEM_CURRICULO_TIPO_NAO_PERMITIDO,
    TAMANHO_MAXIMO_CURRICULO_BYTES,
    TIPOS_MIME_CURRICULO_PERMITIDOS
} from '../constants/recrutamentoConstantes.js';
import { validarAssinaturaArquivoCurriculo } from './validarAssinaturaArquivoCurriculo.js';

/**
 * @param {{ mimetype?: string, originalname?: string, size?: number, buffer?: Buffer } | undefined} arquivo
 * @returns {{ tipoMime: string, nomeArquivo: string, tamanhoBytes: number }}
 */
export function validarArquivoCurriculo(arquivo) {
    if (!arquivo || !arquivo.buffer) {
        throw new Error(MENSAGEM_CURRICULO_OBRIGATORIO);
    }

    const tipoMime = typeof arquivo.mimetype === 'string' ? arquivo.mimetype.trim().toLowerCase() : '';
    const nomeArquivo = typeof arquivo.originalname === 'string' ? arquivo.originalname.trim() : '';
    const tamanhoBytes = typeof arquivo.size === 'number' ? arquivo.size : 0;
    const nomeMinusculo = nomeArquivo.toLowerCase();

    const extensaoValida = EXTENSOES_CURRICULO_PERMITIDAS.some((extensao) =>
        nomeMinusculo.endsWith(extensao)
    );

    const tipoMimeValido = TIPOS_MIME_CURRICULO_PERMITIDOS.includes(tipoMime);

    if (!tipoMimeValido || !extensaoValida) {
        throw new Error(MENSAGEM_CURRICULO_TIPO_NAO_PERMITIDO);
    }

    if (tamanhoBytes > TAMANHO_MAXIMO_CURRICULO_BYTES) {
        throw new Error(MENSAGEM_CURRICULO_TAMANHO_EXCEDIDO);
    }

    validarAssinaturaArquivoCurriculo(arquivo.buffer, nomeArquivo);

    return {
        tipoMime,
        nomeArquivo: nomeArquivo || 'curriculo',
        tamanhoBytes
    };
}
