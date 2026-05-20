import linkQuesitoToRoleService from '../services/LinkQuesitoToRoleService.js';
import listQuesitosVinculadosAoCargoService from '../services/ListQuesitosVinculadosAoCargoService.js';
import unlinkQuesitoFromRoleService from '../services/UnlinkQuesitoFromRoleService.js';
import { criarErroHttp } from '../../../../shared/errors/criarErroHttp.js';

class QuesitoToRoleController {
    async link(request, response, next) {
        try {
            const resultado = await linkQuesitoToRoleService.execute(request.body);
            return response.status(201).json(resultado);
        } catch (erro) {
            return next(this.normalizarErroValidacao(erro));
        }
    }

    async unlink(request, response, next) {
        try {
            const { roleId, quesitoId } = request.params;
            const resultado = await unlinkQuesitoFromRoleService.execute({ roleId, quesitoId });
            return response.status(200).json(resultado);
        } catch (erro) {
            return next(this.normalizarErroValidacao(erro));
        }
    }

    async listByRole(request, response, next) {
        try {
            const { roleId } = request.params;
            const listaVinculos = await listQuesitosVinculadosAoCargoService.execute(roleId);
            return response.status(200).json(listaVinculos);
        } catch (erro) {
            return next(erro);
        }
    }

    /**
     * @param {Error} erro
     * @returns {Error}
     */
    normalizarErroValidacao(erro) {
        if (erro.statusCode) {
            return erro;
        }
        return criarErroHttp(erro.message);
    }
}

export default new QuesitoToRoleController();
