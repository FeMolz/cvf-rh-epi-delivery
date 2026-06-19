import quesitoRepository from '../repositories/QuesitoRepository.js';
import { criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import { MENSAGEM_QUESITO_NAO_ENCONTRADO } from '../constants/quesitoConstantes.js';

class DeleteQuesitoService {
    /**
     * @param {string} identificadorQuesito
     */
    async execute(identificadorQuesito) {
        const quesito = await quesitoRepository.findById(identificadorQuesito);

        if (!quesito) {
            throw criarErroNaoEncontrado(MENSAGEM_QUESITO_NAO_ENCONTRADO);
        }

        await quesitoRepository.delete(identificadorQuesito);
        return quesito;
    }
}

export default new DeleteQuesitoService();
