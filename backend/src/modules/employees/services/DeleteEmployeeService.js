import employeeRepository from '../repositories/EmployeeRepository.js';
import { criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';

class DeleteEmployeeService {
    /**
     * @param {string} identificadorFuncionario
     */
    async execute(identificadorFuncionario) {
        const funcionario = await employeeRepository.findById(identificadorFuncionario);

        if (!funcionario || funcionario.deletedAt) {
            throw criarErroNaoEncontrado('Funcionário não encontrado');
        }

        return employeeRepository.delete(identificadorFuncionario);
    }
}

export default new DeleteEmployeeService();
