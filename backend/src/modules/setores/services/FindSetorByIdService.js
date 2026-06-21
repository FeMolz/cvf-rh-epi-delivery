import setorRepository from '../repositories/SetorRepository.js';
import { criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import { MENSAGEM_SETOR_NAO_ENCONTRADO } from '../constants/setorConstantes.js';

class FindSetorByIdService {
    /**
     * @param {string} identificadorSetor
     */
    async execute(identificadorSetor) {
        const setor = await setorRepository.findById(identificadorSetor);

        if (!setor) {
            throw criarErroNaoEncontrado(MENSAGEM_SETOR_NAO_ENCONTRADO);
        }

        return setor;
    }
}

export default new FindSetorByIdService();
