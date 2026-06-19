import linkEpiToRoleService from '../services/LinkEpiToRoleService.js';
import listEpisByRoleService from '../services/ListEpisByRoleService.js';
import unlinkEpiFromRoleService from '../services/UnlinkEpiFromRoleService.js';

class EpiToRoleController {
    async link(request, response, next) {
        try {
            const { roleId, caNumber, periodicityDays } = request.body;
            const resultado = await linkEpiToRoleService.execute({
                roleId,
                caNumber,
                periodicityDays
            });
            return response.status(201).json(resultado);
        } catch (erro) {
            return next(erro);
        }
    }

    async unlink(request, response, next) {
        try {
            const { roleId, epiId } = request.params;
            const resultado = await unlinkEpiFromRoleService.execute({ roleId, epiId });
            return response.status(200).json(resultado);
        } catch (erro) {
            return next(erro);
        }
    }

    async listByRole(request, response, next) {
        try {
            const { roleId } = request.params;
            const roleEpis = await listEpisByRoleService.execute(roleId);
            return response.status(200).json(roleEpis);
        } catch (erro) {
            return next(erro);
        }
    }
}

export default new EpiToRoleController();
