import createSetorService from '../services/CreateSetorService.js';
import deleteSetorService from '../services/DeleteSetorService.js';
import findSetorByIdService from '../services/FindSetorByIdService.js';
import listSetoresService from '../services/ListSetoresService.js';
import updateSetorService from '../services/UpdateSetorService.js';

class SetorController {
    async create(request, response, next) {
        try {
            const { nome, isActive } = request.body;
            const setor = await createSetorService.execute({ nome, isActive });
            return response.status(201).json(setor);
        } catch (erro) {
            return next(erro);
        }
    }

    async findAll(request, response, next) {
        try {
            const setores = await listSetoresService.execute();
            return response.json(setores);
        } catch (erro) {
            return next(erro);
        }
    }

    async findById(request, response, next) {
        try {
            const { id } = request.params;
            const setor = await findSetorByIdService.execute(id);
            return response.status(200).json(setor);
        } catch (erro) {
            return next(erro);
        }
    }

    async update(request, response, next) {
        try {
            const { id } = request.params;
            const { nome, isActive } = request.body;
            const setor = await updateSetorService.execute(id, { nome, isActive });
            return response.status(200).json(setor);
        } catch (erro) {
            return next(erro);
        }
    }

    async delete(request, response, next) {
        try {
            const { id } = request.params;
            await deleteSetorService.execute(id);
            return response.status(204).send();
        } catch (erro) {
            return next(erro);
        }
    }
}

export default new SetorController();
