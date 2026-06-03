import { basename } from 'node:path';

/**
 * @param {string} nomeArquivo
 * @returns {string}
 */
export function sanitizarNomeArquivoDownload(nomeArquivo) {
    const nomeBase = basename(String(nomeArquivo ?? 'curriculo'));
    const nomeSanitizado = nomeBase.replace(/[^\w.\- ()áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/gi, '_');

    if (!nomeSanitizado || nomeSanitizado === '.' || nomeSanitizado === '..') {
        return 'curriculo';
    }

    return nomeSanitizado.slice(0, 200);
}
