import linkEpiToRoleService from '../services/LinkEpiToRoleService.js';
import unlinkEpiFromRoleService from '../services/UnlinkEpiFromRoleService.js';
import prisma from '../../../../config/database.js';

class EpiToRoleController {
    async link(req, res) {
        try {
            // caNumber comes from body because it's a new link
            const { roleId, caNumber, periodicityDays } = req.body;
            
            const result = await linkEpiToRoleService.execute({ roleId, caNumber, periodicityDays });
            return res.status(201).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async unlink(req, res) {
        try {
            const { roleId, epiId } = req.params;
            
            const result = await unlinkEpiFromRoleService.execute({ roleId, epiId });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async listByRole(req, res) {
        try {
            const { roleId } = req.params;
            
            const roleEpis = await prisma.roleEpi.findMany({
                where: { roleId },
                include: {
                    epi: true
                }
            });
            return res.status(200).json(roleEpis);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar EPIs vinculados a este cargo.' });
        }
    }
}

export default new EpiToRoleController();
