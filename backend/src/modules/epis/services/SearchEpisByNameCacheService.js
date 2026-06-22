import epiRepository from '../repositories/EpiRepository.js';
import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';
import {
    LIMITE_RESULTADOS_BUSCA_EPI_POR_NOME,
    MENSAGEM_NOME_EPI_OBRIGATORIO_BUSCA,
    MENSAGEM_TERMO_BUSCA_EPI_MINIMO
} from '../constants/epiConstantes.js';

class SearchEpisByNameCacheService {
    /**
     * @param {string} nome
     */
    async execute(nome) {
        const termo = String(nome || '').trim();

        if (!termo) {
            throw criarErroHttp(MENSAGEM_NOME_EPI_OBRIGATORIO_BUSCA, 400);
        }

        if (termo.length < 2) {
            throw criarErroHttp(MENSAGEM_TERMO_BUSCA_EPI_MINIMO, 400);
        }

        return epiRepository.findAtivosPorNomeContendo(termo, LIMITE_RESULTADOS_BUSCA_EPI_POR_NOME);
    }
}

export default new SearchEpisByNameCacheService();
