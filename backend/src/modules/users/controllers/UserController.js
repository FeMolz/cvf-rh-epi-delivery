import createUserService from '../services/CreateUserService.js';
import authenticateUserService from '../services/AuthenticateUserService.js';
import listUsersService from '../services/ListUsersService.js';
import findUserByIdService from '../services/FindUserByIdService.js';
import findUserByEmailService from '../services/FindUserByEmailService.js';
import updateUserService from '../services/UpdateUserService.js';
import deleteUserService from '../services/DeleteUserService.js';
import deleteMeService from '../services/DeleteMeService.js';
import changePasswordService from '../services/ChangePasswordService.js';
import logoutUserService from '../services/LogoutUserService.js';
import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';
import { formatarRespostaUsuario } from '../utils/formatarRespostaUsuario.js';
import {

    MENSAGEM_CAMPOS_OBRIGATORIOS_CRIAR_USUARIO,

    MENSAGEM_EMAIL_SENHA_OBRIGATORIOS_LOGIN

} from '../constants/usuarioConstantes.js';

class UserController {
    constructor() {
        this.create = this.create.bind(this);
        this.login = this.login.bind(this);
        this.findAll = this.findAll.bind(this);
        this.findById = this.findById.bind(this);
        this.findByEmail = this.findByEmail.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.deleteMe = this.deleteMe.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.logout = this.logout.bind(this);
    }

    async create(requisicao, resposta, proximo) {

        try {
            const { name, email, password, role } = requisicao.body;

            if (!name || !email || !password) {
                throw criarErroHttp(MENSAGEM_CAMPOS_OBRIGATORIOS_CRIAR_USUARIO);

            }

            const usuario = await createUserService.execute({

                name,
                email,
                password,
                role,
                papelSolicitante: requisicao.user?.role
            });

            return resposta.status(201).json(usuario);

        } catch (erro) {
            if (erro.statusCode === 400 || erro.statusCode === 403) {
                return resposta.status(erro.statusCode).json({ error: erro.message });

            }

            return proximo(erro);

        }

    }

    async login(requisicao, resposta, proximo) {
        try {
            const { email, password } = requisicao.body;

            if (!email || !password) {
                throw criarErroHttp(MENSAGEM_EMAIL_SENHA_OBRIGATORIOS_LOGIN);

            }

            const resultado = await authenticateUserService.execute({ email, password });
            return resposta.json(resultado);

        } catch (erro) {
            erro.statusCode = erro.statusCode || 401;

            return proximo(erro);
        }

    }

    async findAll(requisicao, resposta, proximo) {
        try {
            const usuarios = await listUsersService.execute(requisicao.user.role);

            return resposta.json(usuarios);

        } catch (erro) {
            return proximo(erro);
        }

    }

    async findById(requisicao, resposta, proximo) {
        try {
            const usuario = await findUserByIdService.execute(
                requisicao.params.id,
                requisicao.user.role
            );

            return resposta.json(usuario);

        } catch (erro) {

            return proximo(erro);

        }

    }

    async findByEmail(requisicao, resposta, proximo) {
        try {
            const usuario = await findUserByEmailService.execute(
                requisicao.params.email,
                requisicao.user.role

            );

            return resposta.json(usuario);

        } catch (erro) {

            return proximo(erro);

        }

    }

    async update(requisicao, resposta, proximo) {
        try {
            const usuario = await updateUserService.execute(
                requisicao.params.id,
                requisicao.body,
                requisicao.user.role
            );

            return resposta.json(usuario);

        } catch (erro) {
            if (erro.statusCode === 400 || erro.statusCode === 403 || erro.statusCode === 404) {

                return resposta.status(erro.statusCode).json({ error: erro.message });

            }

            return proximo(erro);

        }

    }

    async delete(requisicao, resposta, proximo) {
        try {
            const usuario = await deleteUserService.execute(requisicao.params.id);

            return resposta.json(formatarRespostaUsuario(usuario, requisicao.user.role));

        } catch (erro) {

            return proximo(erro);

        }

    }

    async deleteMe(requisicao, resposta, proximo) {
        try {
            const resultado = await deleteMeService.execute(requisicao.user.id);

            return resposta.json(resultado);

        } catch (erro) {

            return proximo(erro);

        }

    }

    async logout(requisicao, resposta, proximo) {
        try {
            const usuario = await logoutUserService.execute(requisicao.user.id);
            return resposta.json(formatarRespostaUsuario(usuario, requisicao.user.role));
        } catch (erro) {
            return proximo(erro);
        }
    }

    async changePassword(requisicao, resposta, proximo) {
        try {
            const usuario = await changePasswordService.execute({

                identificadorUsuarioAlvo: requisicao.params.id,
                novaSenha: requisicao.body.password,
                identificadorUsuarioAutenticado: requisicao.user.id,
                papelUsuarioAutenticado: requisicao.user.role

            });

            return resposta.json(formatarRespostaUsuario(usuario, requisicao.user.role));

        } catch (erro) {

            return proximo(erro);

        }

    }

}



export default new UserController();

