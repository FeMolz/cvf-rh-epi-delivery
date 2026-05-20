import roleRepository from '../repositories/RoleRepository.js';
import { criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';

class UpdateRoleService {
    /**
     * @param {string} identificadorCargo
     * @param {{ name: string, description?: string }} dadosAtualizacao
     */
    async execute(identificadorCargo, { name, description }) {
        const cargoExiste = await roleRepository.exists(identificadorCargo);

        if (!cargoExiste) {
            throw criarErroNaoEncontrado('Cargo não encontrado');
        }

        return roleRepository.update(identificadorCargo, name, description);
    }
}

export default new UpdateRoleService();
