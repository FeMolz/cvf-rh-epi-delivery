import bcrypt from 'bcryptjs';
import userRepository from '../repositories/UserRepository.js';
import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';
import { validarPoliticaSenha } from '../../../shared/utils/validarSenha.js';
import { MENSAGEM_SENHA_FRACA } from '../../../shared/constants/segurancaConstantes.js';
import {
    PAPEIS_CADASTRO_USUARIO,
    PAPEL_ADMIN
} from '../../../shared/constants/papeisUsuarioConstantes.js';
import { podeAtribuirPapelUsuario } from '../../../shared/utils/hierarquiaPapeisUsuario.js';
import { normalizarTextoMaiusculo } from '../../../shared/utils/normalizarTextoMaiusculo.js';
import { formatarRespostaUsuario } from '../utils/formatarRespostaUsuario.js';
import {
    MENSAGEM_EMAIL_JA_CADASTRADO,
    MENSAGEM_SEM_PERMISSAO_CADASTRAR_USUARIO,
    MENSAGEM_SEM_PERMISSAO_DEFINIR_PAPEL_ADMIN,
    MENSAGEM_SEM_PERMISSAO_DEFINIR_PAPEL_SUPERIOR,
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

        if (!papelSolicitante || !PAPEIS_CADASTRO_USUARIO.includes(papelSolicitante)) {
            throw criarErroHttp(MENSAGEM_SEM_PERMISSAO_CADASTRAR_USUARIO, 403);
        }

        if (!podeAtribuirPapelUsuario(papelSolicitante, papelInformado)) {
            if (papelInformado === PAPEL_ADMIN) {
                throw criarErroHttp(MENSAGEM_SEM_PERMISSAO_DEFINIR_PAPEL_ADMIN, 403);
            }

            throw criarErroHttp(MENSAGEM_SEM_PERMISSAO_DEFINIR_PAPEL_SUPERIOR, 403);
        }

        const emailExistente = await userRepository.findByEmail(email);

        if (emailExistente) {
            throw criarErroHttp(MENSAGEM_EMAIL_JA_CADASTRADO);
        }

        try {
            validarPoliticaSenha(password);
        } catch (erroValidacao) {
            throw criarErroHttp(erroValidacao.message || MENSAGEM_SENHA_FRACA, 400);
        }

        const hashSenha = await bcrypt.hash(password, 10);

        const usuarioCriado = await userRepository.create({
            name: normalizarTextoMaiusculo(name),
            email,
            passwordHash: hashSenha,
            role: papelInformado
        });

        return formatarRespostaUsuario(usuarioCriado, papelSolicitante);
    }
}

export default new CreateUserService();
