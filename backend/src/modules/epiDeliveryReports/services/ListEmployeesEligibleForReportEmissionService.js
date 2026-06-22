import epiDeliveryReportRepository from '../repositories/EpiDeliveryReportRepository.js';

class ListEmployeesEligibleForReportEmissionService {
    async execute() {
        return epiDeliveryReportRepository.findFuncionariosElegiveisEmissaoRelatorio();
    }
}

export default new ListEmployeesEligibleForReportEmissionService();
