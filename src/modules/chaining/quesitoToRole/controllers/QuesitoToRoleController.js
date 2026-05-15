import linkQuesitoToRoleService from '../services/LinkQuesitoToRoleService.js';
import listQuesitosVinculadosAoCargoService from '../services/ListQuesitosVinculadosAoCargoService.js';
import unlinkQuesitoFromRoleService from '../services/UnlinkQuesitoFromRoleService.js';

class QuesitoToRoleController {
    async link(req, res) {
        try {
            const { roleId, quesitoId } = req.body;
            const resultado = await linkQuesitoToRoleService.execute({ roleId, quesitoId });
            return res.status(201).json(resultado);
        } catch (erro) {
            return res.status(400).json({ error: erro.message });
        }
    }

    async unlink(req, res) {
        try {
            const { roleId, quesitoId } = req.params;
            const resultado = await unlinkQuesitoFromRoleService.execute({ roleId, quesitoId });
            return res.status(200).json(resultado);
        } catch (erro) {
            return res.status(400).json({ error: erro.message });
        }
    }

    async listByRole(req, res, next) {
        try {
            const { roleId } = req.params;
            const listaVinculos = await listQuesitosVinculadosAoCargoService.execute(roleId);
            return res.status(200).json(listaVinculos);
        } catch (erro) {
            return next(erro);
        }
    }
}

export default new QuesitoToRoleController();
