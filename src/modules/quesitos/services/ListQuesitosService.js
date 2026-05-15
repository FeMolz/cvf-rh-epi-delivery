import {
    MENSAGEM_FILTROS_NOME_E_BLOCO_EXCLUSIVOS,
    MENSAGEM_QUESITO_NAO_ENCONTRADO
} from '../constants/quesitoConstantes.js';
import quesitoRepository from '../repositories/QuesitoRepository.js';

class ListQuesitosService {
    /**
     * @param {{ nomeFiltro?: string, blocoFiltro?: string }} filtros
     * @returns {Promise<object[]>}
     */
    async execute(filtros) {
        const nomeBruto = filtros.nomeFiltro;
        const blocoBruto = filtros.blocoFiltro;

        const nomeNormalizado =
            typeof nomeBruto === 'string' && nomeBruto.trim().length > 0 ? nomeBruto.trim() : undefined;
        const blocoNormalizado =
            typeof blocoBruto === 'string' && blocoBruto.trim().length > 0 ? blocoBruto.trim() : undefined;

        if (nomeNormalizado && blocoNormalizado) {
            throw new Error(MENSAGEM_FILTROS_NOME_E_BLOCO_EXCLUSIVOS);
        }

        if (nomeNormalizado) {
            const quesitoLocalizado = await quesitoRepository.findByNome(nomeNormalizado);
            if (!quesitoLocalizado) {
                throw new Error(MENSAGEM_QUESITO_NAO_ENCONTRADO);
            }
            return [quesitoLocalizado];
        }

        if (blocoNormalizado) {
            return quesitoRepository.findManyByBloco(blocoNormalizado);
        }

        return quesitoRepository.findAllOrdered();
    }
}

export default new ListQuesitosService();
