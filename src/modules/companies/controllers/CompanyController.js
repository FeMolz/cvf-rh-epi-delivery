import listCompaniesService from '../services/ListCompaniesService.js';

class CompanyController {
    async findAll(request, response, next) {
        try {
            const empresas = await listCompaniesService.execute();
            return response.json(empresas);
        } catch (erro) {
            return next(erro);
        }
    }
}

export default new CompanyController();
