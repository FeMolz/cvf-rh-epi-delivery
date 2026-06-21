import companyRepository from '../repositories/CompanyRepository.js';
import { criarErroHttp, criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import {
    MENSAGEM_EMPRESA_NAO_ENCONTRADA,
    MENSAGEM_EXCLUSAO_EMPRESA_COM_FUNCIONARIOS_VINCULADOS
} from '../constants/companyConstantes.js';

class DeleteCompanyService {
    /**
     * @param {string} identificadorEmpresa
     */
    async execute(identificadorEmpresa) {
        const empresa = await companyRepository.findById(identificadorEmpresa);

        if (!empresa) {
            throw criarErroNaoEncontrado(MENSAGEM_EMPRESA_NAO_ENCONTRADA);
        }

        const quantidadeFuncionarios = await companyRepository.countEmployeesByCompanyId(identificadorEmpresa);

        if (quantidadeFuncionarios > 0) {
            throw criarErroHttp(MENSAGEM_EXCLUSAO_EMPRESA_COM_FUNCIONARIOS_VINCULADOS, 409);
        }

        await companyRepository.deactivate(identificadorEmpresa);
    }
}

export default new DeleteCompanyService();
