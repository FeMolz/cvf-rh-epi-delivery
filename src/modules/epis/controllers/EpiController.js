import fetchEpiFromApiService from '../services/FetchEpiFromApiService.js';
import changeEpiPeriodicityService from '../services/ChangeEpiPeriodicityService.js';
import listCachedEpisService from '../services/ListCachedEpisService.js';
import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';

class EpiController {
    constructor() {
        this.findByCa = this.findByCa.bind(this);
        this.changePeriodicity = this.changePeriodicity.bind(this);
        this.findAllLocal = this.findAllLocal.bind(this);
    }

    async findByCa(requisicao, resposta, proximo) {
        try {
            const { caNumber } = requisicao.params;
            const epi = await fetchEpiFromApiService.execute(caNumber);
            return resposta.status(200).json(epi);
        } catch (erro) {
            const erroHttp = criarErroHttp(erro.message, 404);
            return proximo(erroHttp);
        }
    }

    async changePeriodicity(requisicao, resposta, proximo) {
        try {
            const { roleId, epiId, newPeriodicityDays } = requisicao.body;
            const resultado = await changeEpiPeriodicityService.execute({
                roleId,
                epiId,
                newPeriodicityDays
            });
            return resposta.status(200).json(resultado);
        } catch (erro) {
            return proximo(criarErroHttp(erro.message));
        }
    }

    async findAllLocal(_requisicao, resposta, proximo) {
        try {
            const epis = await listCachedEpisService.execute();
            return resposta.status(200).json(epis);
        } catch (erro) {
            return proximo(criarErroHttp('Erro ao buscar EPIs.', 500));
        }
    }
}

export default new EpiController();
