import roleRepository from '../repositories/RoleRepository.js';

class ListRolesService {
    async execute() {
        return roleRepository.findAll();
    }
}

export default new ListRolesService();
