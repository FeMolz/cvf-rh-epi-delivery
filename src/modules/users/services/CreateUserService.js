import userRepository from "../repositories/UserRepository.js";
import bcrypt from 'bcryptjs'

class CreateUserService {
    async execute({ name, email, password, role }) {

        if (role === 'ADMIN') {
            throw new Error("Não é permitido se cadastrar como ADMIN.");
        }

        const finalRole = role ? role : 'COLABORADOR';

        const emailExists = await userRepository.findByEmail(email);

        if (emailExists) {
            throw new Error("Este e-mail já está cadastrado no sistema.");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await userRepository.create({
            name,
            email,
            passwordHash,
            role: finalRole
        });

        return user;
    }
}

export default new CreateUserService();