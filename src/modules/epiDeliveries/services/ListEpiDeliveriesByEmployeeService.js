import epiDeliveryRepository from '../repositories/EpiDeliveryRepository.js';
import employeeRepository from '../../employees/repositories/EmployeeRepository.js';
import { criarErroHttp, criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import {
    MENSAGEM_FUNCIONARIO_NAO_ENCONTRADO,
    MENSAGEM_IDENTIFICADOR_FUNCIONARIO_OBRIGATORIO
} from '../constants/entregaEpiConstantes.js';

class ListEpiDeliveriesByEmployeeService {
    /**
     * @param {string} identificadorFuncionario
     */
    async execute(identificadorFuncionario) {
        const identificadorNormalizado = String(identificadorFuncionario ?? '').trim();

        if (!identificadorNormalizado) {
            throw criarErroHttp(MENSAGEM_IDENTIFICADOR_FUNCIONARIO_OBRIGATORIO);
        }

        const funcionario = await employeeRepository.findById(identificadorNormalizado);

        if (!funcionario || funcionario.deletedAt) {
            throw criarErroNaoEncontrado(MENSAGEM_FUNCIONARIO_NAO_ENCONTRADO);
        }

        return epiDeliveryRepository.findByEmployeeId(identificadorNormalizado);
    }
}

export default new ListEpiDeliveriesByEmployeeService();
