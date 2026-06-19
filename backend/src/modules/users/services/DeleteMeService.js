import deleteUserService from './DeleteUserService.js';
import { MENSAGEM_CONTA_EXCLUIDA_SUCESSO } from '../constants/usuarioConstantes.js';

class DeleteMeService {
    /**
     * @param {string} identificadorUsuarioAutenticado
     */
    async execute(identificadorUsuarioAutenticado) {
        await deleteUserService.execute(identificadorUsuarioAutenticado);
        return { message: MENSAGEM_CONTA_EXCLUIDA_SUCESSO };
    }
}

export default new DeleteMeService();
