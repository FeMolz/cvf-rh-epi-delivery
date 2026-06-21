import companyRepository from '../repositories/CompanyRepository.js';
import {
    MENSAGEM_CNPJ_EMPRESA_JA_CADASTRADO,
    MENSAGEM_CNPJ_EMPRESA_OBRIGATORIO,
    MENSAGEM_NOME_EMPRESA_OBRIGATORIO
} from '../constants/companyConstantes.js';

class CreateCompanyService {
    /**
     * @param {{ name: string, cnpj: string, isActive?: boolean }} entrada
     */
    async execute(entrada) {
        const name = typeof entrada.name === 'string' ? entrada.name.trim() : '';
        const cnpj = typeof entrada.cnpj === 'string' ? entrada.cnpj.trim() : '';
        const isActive = entrada.isActive !== false;

        if (!name) {
            throw new Error(MENSAGEM_NOME_EMPRESA_OBRIGATORIO);
        }

        if (!cnpj) {
            throw new Error(MENSAGEM_CNPJ_EMPRESA_OBRIGATORIO);
        }

        const empresaExistente = await companyRepository.findByCnpj(cnpj);

        if (empresaExistente) {
            throw new Error(MENSAGEM_CNPJ_EMPRESA_JA_CADASTRADO);
        }

        return companyRepository.create({ name, cnpj, isActive });
    }
}

export default new CreateCompanyService();
