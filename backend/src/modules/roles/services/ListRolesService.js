import roleRepository from '../repositories/RoleRepository.js';
import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';
import { PAPEIS_GESTAO_EMPRESAS_SETORES } from '../../../shared/constants/papeisUsuarioConstantes.js';

class ListRolesService {
    /**
     * @param {{ incluirInativos?: boolean, apenasInativos?: boolean, papelUsuario?: string }} [opcoes]
     */
    async execute({ incluirInativos = false, apenasInativos = false, papelUsuario } = {}) {
        const podeListarInativos = PAPEIS_GESTAO_EMPRESAS_SETORES.includes(papelUsuario);

        if ((incluirInativos || apenasInativos) && !podeListarInativos) {
            throw criarErroHttp('Apenas perfis de gestão podem listar cargos inativos.', 403);
        }

        return roleRepository.findAll({ incluirInativos, apenasInativos });
    }
}

export default new ListRolesService();
