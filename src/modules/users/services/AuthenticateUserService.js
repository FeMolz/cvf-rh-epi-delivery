import userRepository from "../repositories/UserRepository.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../../../config/env.js';

class AuthenticateUserService {
    async execute({ email, password }) {
        const user = await userRepository.findByEmail(email);

        if (!user) {
            throw new Error("Email ou senha incorretos.");
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatch) {
            throw new Error("Email ou senha incorretos.");
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            env.JWT_SECRET || process.env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '1d' }
        );

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        };
    }
}

export default new AuthenticateUserService();
