import epiDeliveryReportRepository from '../repositories/EpiDeliveryReportRepository.js';

class ListEmployeesWithReportHistoryService {
    async execute() {
        return epiDeliveryReportRepository.findFuncionariosComHistoricoEmissoes();
    }
}

export default new ListEmployeesWithReportHistoryService();
