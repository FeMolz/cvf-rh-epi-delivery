import {
    EXTENSOES_CURRICULO_PERMITIDAS,
    MENSAGEM_CURRICULO_OBRIGATORIO,
    MENSAGEM_CURRICULO_TAMANHO_EXCEDIDO,
    MENSAGEM_CURRICULO_TIPO_NAO_PERMITIDO,
    TAMANHO_MAXIMO_CURRICULO_BYTES,
    TIPOS_MIME_CURRICULO_PERMITIDOS
} from '../constants/recrutamentoConstantes.js';

/**
 * @param {{ mimetype?: string, originalname?: string, size?: number } | undefined} arquivo
 * @returns {{ tipoMime: string, nomeArquivo: string, tamanhoBytes: number }}
 */
export function validarArquivoCurriculo(arquivo) {
    if (!arquivo || !arquivo.buffer) {
        throw new Error(MENSAGEM_CURRICULO_OBRIGATORIO);
    }

    const tipoMime = typeof arquivo.mimetype === 'string' ? arquivo.mimetype.trim().toLowerCase() : '';
    const nomeArquivo = typeof arquivo.originalname === 'string' ? arquivo.originalname.trim() : '';
    const tamanhoBytes = typeof arquivo.size === 'number' ? arquivo.size : 0;

    const extensaoValida = EXTENSOES_CURRICULO_PERMITIDAS.some((extensao) =>
        nomeArquivo.toLowerCase().endsWith(extensao)
    );

    const tipoMimeValido = TIPOS_MIME_CURRICULO_PERMITIDOS.includes(tipoMime);

    if (!tipoMimeValido && !extensaoValida) {
        throw new Error(MENSAGEM_CURRICULO_TIPO_NAO_PERMITIDO);
    }

    if (tamanhoBytes > TAMANHO_MAXIMO_CURRICULO_BYTES) {
        throw new Error(MENSAGEM_CURRICULO_TAMANHO_EXCEDIDO);
    }

    return {
        tipoMime: tipoMime || 'application/octet-stream',
        nomeArquivo: nomeArquivo || 'curriculo',
        tamanhoBytes
    };
}
