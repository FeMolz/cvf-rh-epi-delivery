import userRepository from '../repositories/UserRepository.js';
import { formatarListaRespostaUsuario } from '../utils/formatarRespostaUsuario.js';

class ListUsersService {
    /**
     * @param {string} papelVisualizador
     */
    async execute(papelVisualizador) {
        const usuarios = await userRepository.findAll();
        return formatarListaRespostaUsuario(usuarios, papelVisualizador);
    }
}

export default new ListUsersService();
