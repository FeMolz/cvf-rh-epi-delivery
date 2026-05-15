import epiDeliveryReportRepository from '../repositories/EpiDeliveryReportRepository.js';

class ListPendingEpiDeliveryReportsService {
    async execute() {
        return epiDeliveryReportRepository.findAllPendingSignatureOrdered();
    }
}

export default new ListPendingEpiDeliveryReportsService();
