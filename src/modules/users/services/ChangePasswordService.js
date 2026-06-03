import bcrypt from 'bcryptjs';
import userRepository from '../repositories/UserRepository.js';
import { criarErroHttp, criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import { PAPEL_ADMIN } from '../../../shared/constants/papeisUsuarioConstantes.js';
import {
    MENSAGEM_NOVA_SENHA_OBRIGATORIA,
    MENSAGEM_SEM_PERMISSAO_ALTERAR_SENHA,
    MENSAGEM_USUARIO_NAO_ENCONTRADO
} from '../constants/usuarioConstantes.js';

class ChangePasswordService {
    /**
     * @param {{
     *   identificadorUsuarioAlvo: string,
     *   novaSenha: string,
     *   identificadorUsuarioAutenticado: string,
     *   papelUsuarioAutenticado: string
     * }} entrada
     */
    async execute(entrada) {
        const {
            identificadorUsuarioAlvo,
            novaSenha,
            identificadorUsuarioAutenticado,
            papelUsuarioAutenticado
        } = entrada;

        if (!novaSenha || String(novaSenha).trim() === '') {
            throw criarErroHttp(MENSAGEM_NOVA_SENHA_OBRIGATORIA);
        }

        const podeAlterar =
            papelUsuarioAutenticado === PAPEL_ADMIN
            || identificadorUsuarioAutenticado === identificadorUsuarioAlvo;

        if (!podeAlterar) {
            throw criarErroHttp(MENSAGEM_SEM_PERMISSAO_ALTERAR_SENHA, 403);
        }

        const usuario = await userRepository.findById(identificadorUsuarioAlvo);

        if (!usuario) {
            throw criarErroNaoEncontrado(MENSAGEM_USUARIO_NAO_ENCONTRADO);
        }

        const hashSenha = await bcrypt.hash(novaSenha, 10);
        return userRepository.changePassword(identificadorUsuarioAlvo, hashSenha);
    }
}

export default new ChangePasswordService();
