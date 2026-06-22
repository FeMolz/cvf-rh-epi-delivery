import userRepository from '../repositories/UserRepository.js';
import { criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import { MENSAGEM_USUARIO_NAO_ENCONTRADO } from '../constants/usuarioConstantes.js';
import { formatarRespostaUsuario } from '../utils/formatarRespostaUsuario.js';
import { validarVisualizacaoUsuario } from '../utils/validarVisualizacaoUsuario.js';

class FindUserByEmailService {
    /**
     * @param {string} email
     * @param {string} papelVisualizador
     */
    async execute(email, papelVisualizador) {
        const usuario = await userRepository.findByEmail(email);

        if (!usuario) {
            throw criarErroNaoEncontrado(MENSAGEM_USUARIO_NAO_ENCONTRADO);
        }

        validarVisualizacaoUsuario(papelVisualizador, usuario.role);

        return formatarRespostaUsuario(usuario, papelVisualizador);
    }
}

export default new FindUserByEmailService();
