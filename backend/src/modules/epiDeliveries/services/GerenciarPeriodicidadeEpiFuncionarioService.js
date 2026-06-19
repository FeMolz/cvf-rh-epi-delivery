import { STATUS_FUNCIONARIO_PERIODICIDADE_EPI_ATIVA } from '../../employees/constants/funcionarioStatusConstantes.js';
import epiDeliveryRepository from '../repositories/EpiDeliveryRepository.js';

class GerenciarPeriodicidadeEpiFuncionarioService {
    /**
     * @param {string | undefined} statusAnterior
     * @param {string | undefined} statusNovo
     * @param {string} identificadorFuncionario
     */
    async sincronizarPorMudancaStatus(statusAnterior, statusNovo, identificadorFuncionario) {
        if (!identificadorFuncionario || statusAnterior === statusNovo) {
            return;
        }

        const estavaAtivo = statusAnterior === STATUS_FUNCIONARIO_PERIODICIDADE_EPI_ATIVA;
        const ficouAtivo = statusNovo === STATUS_FUNCIONARIO_PERIODICIDADE_EPI_ATIVA;

        if (estavaAtivo && !ficouAtivo) {
            await epiDeliveryRepository.pausarPeriodicidadePorFuncionario(identificadorFuncionario);
            return;
        }

        if (!estavaAtivo && ficouAtivo) {
            await epiDeliveryRepository.retomarPeriodicidadePorFuncionario(identificadorFuncionario);
        }
    }

    /**
     * @param {string} statusFuncionario
     * @returns {boolean}
     */
    funcionarioPossuiPeriodicidadeEpiAtiva(statusFuncionario) {
        return statusFuncionario === STATUS_FUNCIONARIO_PERIODICIDADE_EPI_ATIVA;
    }
}

export default new GerenciarPeriodicidadeEpiFuncionarioService();
