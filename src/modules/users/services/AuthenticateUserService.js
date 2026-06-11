import userRepository from '../repositories/UserRepository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../../../config/env.js';
import { MENSAGEM_CREDENCIAIS_LOGIN_INVALIDAS } from '../../../shared/constants/segurancaConstantes.js';
import {
    registrarEventoAuditoria,
    TIPOS_EVENTO_AUDITORIA
} from '../../../shared/utils/registrarEventoAuditoria.js';

class AuthenticateUserService {
    async execute({ email, password }) {
        const usuario = await userRepository.findByEmail(email);

        if (!usuario) {
            throw new Error(MENSAGEM_CREDENCIAIS_LOGIN_INVALIDAS);
        }

        const senhaConfere = await bcrypt.compare(password, usuario.passwordHash);

        if (!senhaConfere) {
            throw new Error(MENSAGEM_CREDENCIAIS_LOGIN_INVALIDAS);
        }

        const usuarioOnline = await userRepository.marcarUsuarioOnline(usuario.id);

        const token = jwt.sign(
            { id: usuario.id, role: usuario.role, email: usuario.email },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN }
        );

        registrarEventoAuditoria(TIPOS_EVENTO_AUDITORIA.LOGIN_SUCESSO, {
            identificadorUsuario: usuario.id,
            papel: usuario.role
        });

        return {
            user: {
                id: usuarioOnline.id,
                name: usuarioOnline.name,
                email: usuarioOnline.email,
                role: usuarioOnline.role
            },
            token
        };
    }
}

export default new AuthenticateUserService();
