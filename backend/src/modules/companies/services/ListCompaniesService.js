import companyRepository from '../repositories/CompanyRepository.js';

class ListCompaniesService {
    async execute() {
        return companyRepository.findAllOrdered();
    }
}

export default new ListCompaniesService();
