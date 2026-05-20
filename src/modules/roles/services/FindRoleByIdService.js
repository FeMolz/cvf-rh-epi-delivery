import roleRepository from '../repositories/RoleRepository.js';
import { criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';

class FindRoleByIdService {
    /**
     * @param {string} identificadorCargo
     */
    async execute(identificadorCargo) {
        const cargo = await roleRepository.findById(identificadorCargo);

        if (!cargo) {
            throw criarErroNaoEncontrado('Cargo não encontrado');
        }

        return cargo;
    }
}

export default new FindRoleByIdService();
