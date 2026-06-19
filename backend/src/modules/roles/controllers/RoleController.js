import createRoleService from '../services/CreateRoleService.js';
import deleteRoleService from '../services/DeleteRoleService.js';
import findRoleByIdService from '../services/FindRoleByIdService.js';
import listRolesService from '../services/ListRolesService.js';
import updateRoleService from '../services/UpdateRoleService.js';

class RoleController {
    async create(request, response, next) {
        try {
            const { name, description } = request.body;
            const cargo = await createRoleService.execute({ name, description });
            return response.status(201).json(cargo);
        } catch (erro) {
            return next(erro);
        }
    }

    async findAll(request, response, next) {
        try {
            const incluirInativos = request.query.incluirInativos === 'true';
            const apenasInativos = request.query.apenasInativos === 'true';
            const cargos = await listRolesService.execute({
                incluirInativos,
                apenasInativos,
                papelUsuario: request.user?.role
            });
            return response.status(200).json(cargos);
        } catch (erro) {
            return next(erro);
        }
    }

    async findById(request, response, next) {
        try {
            const { id } = request.params;
            const cargo = await findRoleByIdService.execute(id);
            return response.status(200).json(cargo);
        } catch (erro) {
            return next(erro);
        }
    }

    async update(request, response, next) {
        try {
            const { id } = request.params;
            const { name, description } = request.body;
            const cargo = await updateRoleService.execute(id, { name, description });
            return response.status(200).json(cargo);
        } catch (erro) {
            return next(erro);
        }
    }

    async delete(request, response, next) {
        try {
            const { id } = request.params;
            await deleteRoleService.execute(id);
            return response.status(204).send();
        } catch (erro) {
            return next(erro);
        }
    }
}

export default new RoleController();
