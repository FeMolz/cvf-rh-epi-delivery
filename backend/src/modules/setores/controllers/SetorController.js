import listSetoresService from '../services/ListSetoresService.js';

class SetorController {
    async findAll(request, response, next) {
        try {
            const setores = await listSetoresService.execute();
            return response.json(setores);
        } catch (erro) {
            return next(erro);
        }
    }
}

export default new SetorController();
