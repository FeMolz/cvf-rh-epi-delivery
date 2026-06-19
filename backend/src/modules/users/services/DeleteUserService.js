import userRepository from '../repositories/UserRepository.js';

class DeleteUserService {
    /**
     * @param {string} identificadorUsuario
     */
    async execute(identificadorUsuario) {
        return userRepository.delete(identificadorUsuario);
    }
}

export default new DeleteUserService();
