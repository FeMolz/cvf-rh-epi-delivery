import companyRepository from '../repositories/CompanyRepository.js';
import { criarErroHttp, criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import { normalizarTextoMaiusculo } from '../../../shared/utils/normalizarTextoMaiusculo.js';
import {
    MENSAGEM_CNPJ_EMPRESA_JA_CADASTRADO,
    MENSAGEM_CNPJ_EMPRESA_OBRIGATORIO,
    MENSAGEM_EMPRESA_NAO_ENCONTRADA,
    MENSAGEM_NOME_EMPRESA_OBRIGATORIO
} from '../constants/companyConstantes.js';

class UpdateCompanyService {
    /**
     * @param {string} identificadorEmpresa
     * @param {{ name: string, cnpj: string, isActive?: boolean }} dadosAtualizacao
     */
    async execute(identificadorEmpresa, dadosAtualizacao) {
        const empresa = await companyRepository.findById(identificadorEmpresa);

        if (!empresa) {
            throw criarErroNaoEncontrado(MENSAGEM_EMPRESA_NAO_ENCONTRADA);
        }

        const name = typeof dadosAtualizacao.name === 'string'
            ? normalizarTextoMaiusculo(dadosAtualizacao.name)
            : '';
        const cnpj = typeof dadosAtualizacao.cnpj === 'string' ? dadosAtualizacao.cnpj.trim() : '';
        const isActive = dadosAtualizacao.isActive ?? empresa.isActive;

        if (!name) {
            throw criarErroHttp(MENSAGEM_NOME_EMPRESA_OBRIGATORIO);
        }

        if (!cnpj) {
            throw criarErroHttp(MENSAGEM_CNPJ_EMPRESA_OBRIGATORIO);
        }

        const empresaComMesmoCnpj = await companyRepository.findByCnpj(cnpj, identificadorEmpresa);

        if (empresaComMesmoCnpj) {
            throw criarErroHttp(MENSAGEM_CNPJ_EMPRESA_JA_CADASTRADO, 409);
        }

        return companyRepository.update(identificadorEmpresa, { name, cnpj, isActive });
    }
}

export default new UpdateCompanyService();
