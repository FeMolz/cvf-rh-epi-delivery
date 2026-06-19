import epiRepository from '../repositories/EpiRepository.js';

class ListCachedEpisService {
    async execute() {
        return epiRepository.findAllEpis();
    }
}

export default new ListCachedEpisService();
