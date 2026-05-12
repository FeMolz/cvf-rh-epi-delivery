import createUserService from "../services/CreateUserService.js";
import userRepository from "../repositories/UserRepository.js";
import authenticateUserService from "../services/AuthenticateUserService.js";
import bcrypt from 'bcryptjs';

class UserController {
    async create(req, res) {
        try {
            const { name, email, password, role } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            const result = await createUserService.execute({ name, email, password, role });

            if (result instanceof Error) {
                return res.status(400).json({ error: result.message });
            }

            return res.status(201).json(result);

        } catch (error) {
            console.error("Error creating user:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    async findAll(req, res) {
        try {
            const users = await userRepository.findAll();
            return res.json(users);

        } catch (error) {
            console.error("Error finding users:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    async findById(req, res) {
        try {
            const { id } = req.params;
            const user = await userRepository.findById(id);

            return res.json(user);
        } catch (error) {
            console.error("Error finding user:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    async findByEmail(req, res) {
        try {
            const { email } = req.params;
            const user = await userRepository.findByEmail(email);

            return res.json(user);

        } catch (error) {
            console.error("Error finding user:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, email, role } = req.body;
            const user = await userRepository.update(id, { name, email, role });

            return res.json(user);

        } catch (error) {
            console.error("Error updating user:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const user = await userRepository.delete(id);

            return res.json(user);

        } catch (error) {
            if (error.code === 'NOT_FOUND') {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            console.error('Error deleting user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async deleteMe(req, res) {
        try {
            const userId = req.user.id;
            const user = await userRepository.delete(userId);

            return res.json({ message: "Sua conta foi excluída com sucesso." });

        } catch (error) {
            console.error("Error deleting own account:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    // ... existing imports remain

    async changePassword(req, res) {
        try {
            const { id } = req.params;
            const { password } = req.body;
            if (!password) {
                return res.status(400).json({ error: 'Nova senha não informada.' });
            }
            const passwordHash = await bcrypt.hash(password, 10);
            const user = await userRepository.changePassword(id, passwordHash);
            return res.json(user);
        } catch (error) {
            console.error('Error changing password:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: "Email e senha são obrigatórios." });
            }

            const result = await authenticateUserService.execute({ email, password });

            return res.json(result);
        } catch (error) {
            return res.status(401).json({ error: error.message });
        }
    }
}

export default new UserController();