import roleEpiRepository from '../repositories/RoleEpiRepository.js';

class ListEpisByRoleService {
    /**
     * @param {string} roleId
     */
    async execute(roleId) {
        return roleEpiRepository.findManyByRole(roleId);
    }
}

export default new ListEpisByRoleService();
