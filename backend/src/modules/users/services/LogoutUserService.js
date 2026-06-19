import userRepository from '../repositories/UserRepository.js';
import { criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import { MENSAGEM_USUARIO_NAO_ENCONTRADO } from '../constants/usuarioConstantes.js';
import {
    registrarEventoAuditoria,
    TIPOS_EVENTO_AUDITORIA
} from '../../../shared/utils/registrarEventoAuditoria.js';

class LogoutUserService {
    /**
     * @param {string} identificadorUsuario
     */
    async execute(identificadorUsuario) {
        const usuario = await userRepository.findById(identificadorUsuario);

        if (!usuario) {
            throw criarErroNaoEncontrado(MENSAGEM_USUARIO_NAO_ENCONTRADO);
        }

        const usuarioAtualizado = await userRepository.marcarUsuarioOffline(identificadorUsuario);

        registrarEventoAuditoria(TIPOS_EVENTO_AUDITORIA.LOGOUT, {
            identificadorUsuario
        });

        return usuarioAtualizado;
    }
}

export default new LogoutUserService();
