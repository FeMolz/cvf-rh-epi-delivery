import userRepository from '../repositories/UserRepository.js';
import { podeAtribuirPapelUsuario } from '../../../shared/utils/hierarquiaPapeisUsuario.js';
import { formatarListaRespostaUsuario } from '../utils/formatarRespostaUsuario.js';

class ListUsersService {
    /**
     * @param {string} papelVisualizador
     */
    async execute(papelVisualizador) {
        const usuarios = await userRepository.findAll();
        const usuariosVisiveis = usuarios.filter((usuario) =>
            podeAtribuirPapelUsuario(papelVisualizador, usuario.role)
        );

        return formatarListaRespostaUsuario(usuariosVisiveis, papelVisualizador);
    }
}

export default new ListUsersService();
