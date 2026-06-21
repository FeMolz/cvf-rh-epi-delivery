import companyRepository from '../repositories/CompanyRepository.js';
import { criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import { MENSAGEM_EMPRESA_NAO_ENCONTRADA } from '../constants/companyConstantes.js';

class FindCompanyByIdService {
    /**
     * @param {string} identificadorEmpresa
     */
    async execute(identificadorEmpresa) {
        const empresa = await companyRepository.findById(identificadorEmpresa);

        if (!empresa) {
            throw criarErroNaoEncontrado(MENSAGEM_EMPRESA_NAO_ENCONTRADA);
        }

        return empresa;
    }
}

export default new FindCompanyByIdService();
