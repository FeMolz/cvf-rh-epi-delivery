import fetchEpiFromApiService from '../services/FetchEpiFromApiService.js';
import changeEpiPeriodicityService from '../services/ChangeEpiPeriodicityService.js';
import listCachedEpisService from '../services/ListCachedEpisService.js';

class EpiController {
    async findByCa(req, res) {
        try {
            const { caNumber } = req.params;
            const epi = await fetchEpiFromApiService.execute(caNumber);
            return res.status(200).json(epi);
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    }

    async changePeriodicity(req, res) {
        try {
            const { roleId, epiId, newPeriodicityDays } = req.body;
            const result = await changeEpiPeriodicityService.execute({ roleId, epiId, newPeriodicityDays });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async findAllLocal(req, res) {
        try {
            const epis = await listCachedEpisService.execute();
            return res.status(200).json(epis);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar EPIs.' });
        }
    }
}

export default new EpiController();
