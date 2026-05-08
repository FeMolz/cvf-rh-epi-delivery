import createRoleService from "../services/CreateRoleService.js";

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
}

export default new RoleController();