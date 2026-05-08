import createRoleService from "../services/CreateRoleService.js";
import roleRepository from "../repositories/RoleRepository.js";

class RoleController {
    async create(req, res, next) {
        try {
            const { name, description } = req.body;

            const role = await createRoleService.execute({
                name,
                description
            });

            return res.status(201).json(role);
        } catch (error) {
            next(error)
        }
    }
    async findAll(req, res, next) {
        try {
            const roles = await roleRepository.findAll();
            return res.status(200).json(roles);
        } catch (error) {
            next(error);
        }
    }

    async findById(req, res, next) {
        try {
            const { id } = req.params;
            const role = await roleRepository.findById(id);
            
            if (!role) {
                return res.status(404).json({ error: 'Cargo não encontrado' });
            }
            
            return res.status(200).json(role);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { name, description } = req.body;
            
            const roleExists = await roleRepository.exists(id);
            if (!roleExists) {
                return res.status(404).json({ error: 'Cargo não encontrado' });
            }
            
            const role = await roleRepository.update(id, name, description);
            return res.status(200).json(role);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            
            const roleExists = await roleRepository.exists(id);
            if (!roleExists) {
                return res.status(404).json({ error: 'Cargo não encontrado' });
            }
            
            await roleRepository.delete(id);
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export default new RoleController();