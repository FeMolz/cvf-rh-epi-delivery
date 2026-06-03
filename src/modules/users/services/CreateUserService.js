import bcrypt from 'bcryptjs';
import userRepository from '../repositories/UserRepository.js';
import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';
import { PAPEL_ADMIN } from '../../../shared/constants/papeisUsuarioConstantes.js';
import { formatarRespostaUsuario } from '../utils/formatarRespostaUsuario.js';
import {
    MENSAGEM_EMAIL_JA_CADASTRADO,
    MENSAGEM_SEM_PERMISSAO_DEFINIR_PAPEL_ADMIN,
    PAPEL_PADRAO_NOVO_USUARIO
} from '../constants/usuarioConstantes.js';

class CreateUserService {
    /**
     * @param {{
     *   name: string,
     *   email: string,
     *   password: string,
     *   role?: string,
     *   papelSolicitante?: string
     * }} entrada
     */
    async execute(entrada) {
        const { name, email, password, role, papelSolicitante } = entrada;
        const papelInformado = role || PAPEL_PADRAO_NOVO_USUARIO;

        if (papelInformado === PAPEL_ADMIN && papelSolicitante !== PAPEL_ADMIN) {
            throw criarErroHttp(MENSAGEM_SEM_PERMISSAO_DEFINIR_PAPEL_ADMIN, 403);
        }

        const emailExistente = await userRepository.findByEmail(email);

        if (emailExistente) {
            throw criarErroHttp(MENSAGEM_EMAIL_JA_CADASTRADO);
        }

        const hashSenha = await bcrypt.hash(password, 10);

        const usuarioCriado = await userRepository.create({
            name,
            email,
            passwordHash: hashSenha,
            role: papelInformado
        });

        return formatarRespostaUsuario(usuarioCriado, papelSolicitante);
    }
}

export default new CreateUserService();
