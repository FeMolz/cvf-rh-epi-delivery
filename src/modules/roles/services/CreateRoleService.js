import roleRepository from "../repositories/RoleRepository.js";

class CreateRoleService {
    async execute({ name, description }) {

        const roleExists = await roleRepository.findByName(name);

        if (roleExists) {
            throw new Error("Role already exists.");
        }

        const role = await roleRepository.create(name, description);

        return role;
    }
}

export default new CreateRoleService();