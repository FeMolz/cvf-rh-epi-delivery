import employeeRepository from '../repositories/EmployeeRepository.js';
import { criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';

class FindEmployeeByIdService {
    /**
     * @param {string} identificadorFuncionario
     */
    async execute(identificadorFuncionario) {
        const funcionario = await employeeRepository.findById(identificadorFuncionario);

        if (!funcionario) {
            throw criarErroNaoEncontrado('Funcionário não encontrado');
        }

        return funcionario;
    }
}

export default new FindEmployeeByIdService();
