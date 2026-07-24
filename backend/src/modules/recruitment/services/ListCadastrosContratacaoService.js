import { STATUS_CADASTRO_CONTRATACAO } from '../constants/recrutamentoConstantes.js';
import cadastroContratacaoRepository from '../repositories/CadastroContratacaoRepository.js';

const STATUS_PROCESSO_APROVACAO = [
    STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO,
    STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH
];

class ListCadastrosContratacaoService {
    /**
     * @param {{ status?: string, processoAprovacao?: string | boolean }} filtros
     */
    async execute(filtros = {}) {
        const statusFiltro =
            typeof filtros.status === 'string' && filtros.status.trim()
                ? filtros.status.trim().toUpperCase()
                : undefined;

        if (statusFiltro && !Object.values(STATUS_CADASTRO_CONTRATACAO).includes(statusFiltro)) {
            return [];
        }

        const processoAprovacao =
            filtros.processoAprovacao === 'true' || filtros.processoAprovacao === true;

        if (processoAprovacao && !statusFiltro) {
            return cadastroContratacaoRepository.findMany({ statusIn: STATUS_PROCESSO_APROVACAO });
        }

        return cadastroContratacaoRepository.findMany({ status: statusFiltro });
    }
}

export default new ListCadastrosContratacaoService();
