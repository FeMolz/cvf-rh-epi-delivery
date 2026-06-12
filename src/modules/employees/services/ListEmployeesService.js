import { FILTRO_LISTAGEM_FUNCIONARIOS_ATIVOS } from '../constants/funcionarioStatusConstantes.js';
import employeeRepository from '../repositories/EmployeeRepository.js';
import { montarFiltroConsultaFuncionarios } from '../utils/montarFiltroConsultaFuncionarios.js';

class ListEmployeesService {
    /**
     * @param {string} [filtroConsulta]
     */
    async execute(filtroConsulta = FILTRO_LISTAGEM_FUNCIONARIOS_ATIVOS) {
        const filtroPrisma = montarFiltroConsultaFuncionarios(filtroConsulta);
        return employeeRepository.findManyComFiltro(filtroPrisma);
    }
}

export default new ListEmployeesService();
