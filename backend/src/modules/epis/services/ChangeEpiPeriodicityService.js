import epiRepository from '../repositories/EpiRepository.js';

class ChangeEpiPeriodicityService {
    async execute({ roleId, epiId, newPeriodicityDays }) {
        if (!roleId || !epiId || newPeriodicityDays === undefined) {
            throw new Error('roleId, epiId e newPeriodicityDays são obrigatórios.');
        }

        if (newPeriodicityDays <= 0) {
            throw new Error('A periodicidade deve ser maior que zero.');
        }

        const roleEpi = await epiRepository.findRoleEpiByCompositeKey(roleId, epiId);

        if (!roleEpi) {
            throw new Error('Vínculo entre este Cargo e EPI não encontrado.');
        }

        return epiRepository.updateRoleEpiPeriodicity(roleId, epiId, newPeriodicityDays);
    }
}

export default new ChangeEpiPeriodicityService();
