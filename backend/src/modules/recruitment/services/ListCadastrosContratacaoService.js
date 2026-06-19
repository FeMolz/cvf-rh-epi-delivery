import { STATUS_CADASTRO_CONTRATACAO } from '../constants/recrutamentoConstantes.js';
import cadastroContratacaoRepository from '../repositories/CadastroContratacaoRepository.js';

class ListCadastrosContratacaoService {
    /**
     * @param {{ status?: string }} filtros
     */
    async execute(filtros = {}) {
        const statusFiltro =
            typeof filtros.status === 'string' && filtros.status.trim()
                ? filtros.status.trim().toUpperCase()
                : undefined;

        if (statusFiltro && !Object.values(STATUS_CADASTRO_CONTRATACAO).includes(statusFiltro)) {
            return [];
        }

        return cadastroContratacaoRepository.findMany({ status: statusFiltro });
    }
}

export default new ListCadastrosContratacaoService();
