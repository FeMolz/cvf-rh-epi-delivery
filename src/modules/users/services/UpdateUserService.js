import userRepository from '../repositories/UserRepository.js';
import { criarErroHttp, criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import { PAPEL_ADMIN } from '../../../shared/constants/papeisUsuarioConstantes.js';
import {
    MENSAGEM_SEM_PERMISSAO_DEFINIR_PAPEL_ADMIN,
    MENSAGEM_USUARIO_NAO_ENCONTRADO
} from '../constants/usuarioConstantes.js';

class UpdateUserService {
    /**
     * @param {string} identificadorUsuario
     * @param {{ name?: string, email?: string, role?: string }} dadosAtualizacao
     * @param {string} papelSolicitante
     */
    async execute(identificadorUsuario, dadosAtualizacao, papelSolicitante) {
        const usuarioExistente = await userRepository.findById(identificadorUsuario);

        if (!usuarioExistente) {
            throw criarErroNaoEncontrado(MENSAGEM_USUARIO_NAO_ENCONTRADO);
        }

        if (dadosAtualizacao.role === PAPEL_ADMIN && papelSolicitante !== PAPEL_ADMIN) {
            throw criarErroHttp(MENSAGEM_SEM_PERMISSAO_DEFINIR_PAPEL_ADMIN, 403);
        }

        return userRepository.update(identificadorUsuario, dadosAtualizacao);
    }
}

export default new UpdateUserService();
