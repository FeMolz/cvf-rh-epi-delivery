import userRepository from '../repositories/UserRepository.js';
import { criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import { MENSAGEM_USUARIO_NAO_ENCONTRADO } from '../constants/usuarioConstantes.js';

class FindUserByIdService {
    /**
     * @param {string} identificadorUsuario
     */
    async execute(identificadorUsuario) {
        const usuario = await userRepository.findById(identificadorUsuario);

        if (!usuario) {
            throw criarErroNaoEncontrado(MENSAGEM_USUARIO_NAO_ENCONTRADO);
        }

        return usuario;
    }
}

export default new FindUserByIdService();
