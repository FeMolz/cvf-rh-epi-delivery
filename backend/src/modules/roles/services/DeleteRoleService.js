import roleRepository from '../repositories/RoleRepository.js';
import { criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';

class DeleteRoleService {
    /**
     * @param {string} identificadorCargo
     */
    async execute(identificadorCargo) {
        const cargoExiste = await roleRepository.exists(identificadorCargo);

        if (!cargoExiste) {
            throw criarErroNaoEncontrado('Cargo não encontrado');
        }

        await roleRepository.delete(identificadorCargo);
    }
}

export default new DeleteRoleService();
