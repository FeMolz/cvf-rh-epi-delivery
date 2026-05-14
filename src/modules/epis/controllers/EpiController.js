import fetchEpiFromApiService from '../services/FetchEpiFromApiService.js';
import changeEpiPeriodicityService from '../services/ChangeEpiPeriodicityService.js';
import prisma from '../../../config/database.js';

class EpiController {
    // Busca informações de um EPI específico (no banco local ou na API)
    async findByCa(req, res) {
        try {
            const { caNumber } = req.params;
            const epi = await fetchEpiFromApiService.execute(caNumber);
            return res.status(200).json(epi);
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    }

    // Altera a periodicidade de um EPI vinculado a um Cargo
    async changePeriodicity(req, res) {
        try {
            const { roleId, epiId, newPeriodicityDays } = req.body;
            const result = await changeEpiPeriodicityService.execute({ roleId, epiId, newPeriodicityDays });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    // Lista todos os EPIs cacheados localmente
    async findAllLocal(req, res) {
        try {
            const epis = await prisma.epi.findMany();
            return res.status(200).json(epis);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar EPIs.' });
        }
    }
}

export default new EpiController();
