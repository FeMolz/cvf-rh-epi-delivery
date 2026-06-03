import userRepository from '../repositories/UserRepository.js';
import { criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import { MENSAGEM_USUARIO_NAO_ENCONTRADO } from '../constants/usuarioConstantes.js';

class FindUserByEmailService {
    /**
     * @param {string} email
     */
    async execute(email) {
        const usuario = await userRepository.findByEmail(email);

        if (!usuario) {
            throw criarErroNaoEncontrado(MENSAGEM_USUARIO_NAO_ENCONTRADO);
        }

        const { passwordHash: _senha, ...usuarioSemSenha } = usuario;
        return usuarioSemSenha;
    }
}

export default new FindUserByEmailService();
