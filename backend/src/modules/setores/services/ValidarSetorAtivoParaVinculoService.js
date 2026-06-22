import setorRepository from '../repositories/SetorRepository.js';
import { MENSAGEM_SETOR_INATIVO_PARA_VINCULO } from '../constants/setorConstantes.js';
import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';

class ValidarSetorAtivoParaVinculoService {
    /**
     * @param {string} identificadorSetor
     */
    async execute(identificadorSetor) {
        const setor = await setorRepository.findById(identificadorSetor);

        if (!setor || setor.isActive === false) {
            throw criarErroHttp(MENSAGEM_SETOR_INATIVO_PARA_VINCULO, 400);
        }
    }
}

export default new ValidarSetorAtivoParaVinculoService();
