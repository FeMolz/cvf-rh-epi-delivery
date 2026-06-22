import userRepository from '../repositories/UserRepository.js';
import { criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import { MENSAGEM_USUARIO_NAO_ENCONTRADO } from '../constants/usuarioConstantes.js';
import { formatarRespostaUsuario } from '../utils/formatarRespostaUsuario.js';
import { validarVisualizacaoUsuario } from '../utils/validarVisualizacaoUsuario.js';

class FindUserByIdService {
    /**
     * @param {string} identificadorUsuario
     * @param {string} papelVisualizador
     */
    async execute(identificadorUsuario, papelVisualizador) {
        const usuario = await userRepository.findById(identificadorUsuario);

        if (!usuario) {
            throw criarErroNaoEncontrado(MENSAGEM_USUARIO_NAO_ENCONTRADO);
        }

        validarVisualizacaoUsuario(papelVisualizador, usuario.role);

        return formatarRespostaUsuario(usuario, papelVisualizador);
    }
}

export default new FindUserByIdService();
