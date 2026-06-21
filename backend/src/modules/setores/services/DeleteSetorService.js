import setorRepository from '../repositories/SetorRepository.js';
import { criarErroHttp, criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import {
    MENSAGEM_EXCLUSAO_SETOR_COM_FUNCIONARIOS_VINCULADOS,
    MENSAGEM_SETOR_NAO_ENCONTRADO
} from '../constants/setorConstantes.js';

class DeleteSetorService {
    /**
     * @param {string} identificadorSetor
     */
    async execute(identificadorSetor) {
        const setor = await setorRepository.findById(identificadorSetor);

        if (!setor) {
            throw criarErroNaoEncontrado(MENSAGEM_SETOR_NAO_ENCONTRADO);
        }

        const quantidadeFuncionarios = await setorRepository.countEmployeesBySetorId(identificadorSetor);

        if (quantidadeFuncionarios > 0) {
            throw criarErroHttp(MENSAGEM_EXCLUSAO_SETOR_COM_FUNCIONARIOS_VINCULADOS, 409);
        }

        await setorRepository.deactivate(identificadorSetor);
    }
}

export default new DeleteSetorService();
