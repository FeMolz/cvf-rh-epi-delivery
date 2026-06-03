import userRepository from '../repositories/UserRepository.js';

class ListUsersService {
    async execute() {
        return userRepository.findAll();
    }
}

export default new ListUsersService();
