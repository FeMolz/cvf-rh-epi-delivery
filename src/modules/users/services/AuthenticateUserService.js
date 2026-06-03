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

        if (!usuario || !usuario.isActive) {
            throw new Error(MENSAGEM_CREDENCIAIS_LOGIN_INVALIDAS);
        }

        const senhaConfere = await bcrypt.compare(password, usuario.passwordHash);

        if (!senhaConfere) {
            throw new Error(MENSAGEM_CREDENCIAIS_LOGIN_INVALIDAS);
        }

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
                id: usuario.id,
                name: usuario.name,
                email: usuario.email,
                role: usuario.role
            },
            token
        };
    }
}

export default new AuthenticateUserService();
