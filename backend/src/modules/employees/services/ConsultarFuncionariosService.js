import employeeRepository from '../repositories/EmployeeRepository.js';
import {
    montarOrdenacaoAdmissaoConsulta,
    montarWhereConsultaFuncionarios
} from '../utils/montarFiltroConsultaDepartamentoPessoal.js';

class ConsultarFuncionariosService {
    /**
     * @param {{
     *   companyId?: string;
     *   busca?: string;
     *   situacao?: string;
     *   admissaoDe?: string;
     *   admissaoAte?: string;
     *   ordenacaoAdmissao?: string;
     * }} parametros
     */
    async execute(parametros = {}) {
        const where = montarWhereConsultaFuncionarios(parametros);
        const orderBy = montarOrdenacaoAdmissaoConsulta(parametros.ordenacaoAdmissao);

        return employeeRepository.findManyConsulta(where, orderBy);
    }
}

export default new ConsultarFuncionariosService();
