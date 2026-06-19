import roleRepository from '../repositories/RoleRepository.js';
import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';

class ListRolesService {
    /**
     * @param {{ incluirInativos?: boolean, apenasInativos?: boolean, papelUsuario?: string }} [opcoes]
     */
    async execute({ incluirInativos = false, apenasInativos = false, papelUsuario } = {}) {
        if (incluirInativos && papelUsuario !== 'ADMIN') {
            throw criarErroHttp('Apenas administradores podem listar cargos inativos.', 403);
        }

        return roleRepository.findAll({ incluirInativos, apenasInativos });
    }
}

export default new ListRolesService();
