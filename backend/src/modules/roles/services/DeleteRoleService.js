import roleRepository from '../repositories/RoleRepository.js';
import { MENSAGEM_EXCLUSAO_CARGO_COM_FUNCIONARIOS_VINCULADOS } from '../constants/roleConstantes.js';
import { criarErroHttp, criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';

class DeleteRoleService {
    /**
     * @param {string} identificadorCargo
     */
    async execute(identificadorCargo) {
        const cargoExiste = await roleRepository.exists(identificadorCargo);

        if (!cargoExiste) {
            throw criarErroNaoEncontrado('Cargo não encontrado');
        }

        const quantidadeFuncionarios = await roleRepository.countEmployeesByRoleId(identificadorCargo);

        if (quantidadeFuncionarios > 0) {
            throw criarErroHttp(MENSAGEM_EXCLUSAO_CARGO_COM_FUNCIONARIOS_VINCULADOS, 409);
        }

        await roleRepository.softDelete(identificadorCargo);
    }
}

export default new DeleteRoleService();
