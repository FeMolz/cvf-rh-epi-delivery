import companyRepository from '../repositories/CompanyRepository.js';
import { MENSAGEM_EMPRESA_INATIVA_PARA_VINCULO } from '../constants/companyConstantes.js';
import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';

class ValidarEmpresaAtivaParaVinculoService {
    /**
     * @param {string} identificadorEmpresa
     */
    async execute(identificadorEmpresa) {
        const empresa = await companyRepository.findById(identificadorEmpresa);

        if (!empresa || empresa.isActive === false) {
            throw criarErroHttp(MENSAGEM_EMPRESA_INATIVA_PARA_VINCULO, 400);
        }
    }
}

export default new ValidarEmpresaAtivaParaVinculoService();
