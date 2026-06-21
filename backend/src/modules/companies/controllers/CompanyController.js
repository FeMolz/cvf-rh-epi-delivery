import createCompanyService from '../services/CreateCompanyService.js';
import deleteCompanyService from '../services/DeleteCompanyService.js';
import findCompanyByIdService from '../services/FindCompanyByIdService.js';
import listCompaniesService from '../services/ListCompaniesService.js';
import updateCompanyService from '../services/UpdateCompanyService.js';

class CompanyController {
    async create(request, response, next) {
        try {
            const { name, cnpj, isActive } = request.body;
            const empresa = await createCompanyService.execute({ name, cnpj, isActive });
            return response.status(201).json(empresa);
        } catch (erro) {
            return next(erro);
        }
    }

    async findAll(request, response, next) {
        try {
            const empresas = await listCompaniesService.execute();
            return response.json(empresas);
        } catch (erro) {
            return next(erro);
        }
    }

    async findById(request, response, next) {
        try {
            const { id } = request.params;
            const empresa = await findCompanyByIdService.execute(id);
            return response.status(200).json(empresa);
        } catch (erro) {
            return next(erro);
        }
    }

    async update(request, response, next) {
        try {
            const { id } = request.params;
            const { name, cnpj, isActive } = request.body;
            const empresa = await updateCompanyService.execute(id, { name, cnpj, isActive });
            return response.status(200).json(empresa);
        } catch (erro) {
            return next(erro);
        }
    }

    async delete(request, response, next) {
        try {
            const { id } = request.params;
            await deleteCompanyService.execute(id);
            return response.status(204).send();
        } catch (erro) {
            return next(erro);
        }
    }
}

export default new CompanyController();
