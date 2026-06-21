import listarAniversariantesNoticiasService from '../services/ListarAniversariantesNoticiasService.js';

class NoticiasController {
    constructor() {
        this.listarAniversariantes = this.listarAniversariantes.bind(this);
    }

    async listarAniversariantes(_request, response, next) {
        try {
            const resultado = await listarAniversariantesNoticiasService.execute();
            return response.status(200).json(resultado);
        } catch (erro) {
            return next(erro);
        }
    }
}

export default new NoticiasController();
