import roleRepository from '../repositories/RoleRepository.js';
import { MENSAGEM_CARGO_INATIVO_PARA_VINCULO } from '../constants/roleConstantes.js';
import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';

class ValidarCargoAtivoParaVinculoService {
    /**
     * @param {string} identificadorCargo
     */
    async execute(identificadorCargo) {
        const cargo = await roleRepository.findById(identificadorCargo);

        if (!cargo || cargo.deletedAt) {
            throw criarErroHttp(MENSAGEM_CARGO_INATIVO_PARA_VINCULO, 400);
        }
    }
}

export default new ValidarCargoAtivoParaVinculoService();
