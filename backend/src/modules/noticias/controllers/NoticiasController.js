import listarAniversariantesNoticiasService from '../services/ListarAniversariantesNoticiasService.js';
import listarAfastamentosNoticiasService from '../services/ListarAfastamentosNoticiasService.js';

class NoticiasController {
    constructor() {
        this.listarAniversariantes = this.listarAniversariantes.bind(this);
        this.listarAfastamentos = this.listarAfastamentos.bind(this);
    }

    async listarAniversariantes(_request, response, next) {
        try {
            const resultado = await listarAniversariantesNoticiasService.execute();
            return response.status(200).json(resultado);
        } catch (erro) {
            return next(erro);
        }
    }

    async listarAfastamentos(_request, response, next) {
        try {
            const resultado = await listarAfastamentosNoticiasService.execute();
            return response.status(200).json(resultado);
        } catch (erro) {
            return next(erro);
        }
    }
}

export default new NoticiasController();
