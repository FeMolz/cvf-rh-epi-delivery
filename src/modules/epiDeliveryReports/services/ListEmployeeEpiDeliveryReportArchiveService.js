import epiDeliveryReportRepository from '../repositories/EpiDeliveryReportRepository.js';

import { MENSAGEM_IDENTIFICADOR_FUNCIONARIO_OBRIGATORIO } from '../constants/relatorioEntregaEpiConstantes.js';

class ListEmployeeEpiDeliveryReportArchiveService {
    /**
     * @param {string} identificadorFuncionario
     */
    async execute(identificadorFuncionario) {
        if (!identificadorFuncionario) {
            throw new Error(MENSAGEM_IDENTIFICADOR_FUNCIONARIO_OBRIGATORIO);
        }

        return epiDeliveryReportRepository.findArchiveByEmployeeId(identificadorFuncionario);
    }
}

export default new ListEmployeeEpiDeliveryReportArchiveService();
