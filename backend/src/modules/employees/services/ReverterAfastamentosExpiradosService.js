import { STATUS_FUNCIONARIO_PERIODICIDADE_EPI_ATIVA } from '../constants/funcionarioStatusConstantes.js';
import employeeRepository from '../repositories/EmployeeRepository.js';
import { inicioDoDia } from '../utils/afastamentoTemporarioFuncionario.js';
import gerenciarPeriodicidadeEpiFuncionarioService from '../../epiDeliveries/services/GerenciarPeriodicidadeEpiFuncionarioService.js';

class ReverterAfastamentosExpiradosService {
    /**
     * Retorna funcionários de férias/licença à situação ATIVO quando a data de retorno é atingida.
     * @param {Date} [dataReferencia]
     * @returns {Promise<number>}
     */
    async execute(dataReferencia = new Date()) {
        const referencia = inicioDoDia(dataReferencia);

        if (!referencia) {
            return 0;
        }

        const funcionarios = await employeeRepository.findManyComAfastamentoTemporarioExpirado(referencia);
        let revertidos = 0;

        for (const funcionario of funcionarios) {
            const statusAnterior = String(funcionario.status);
            const funcionarioAtualizado = await employeeRepository.update(funcionario.id, {
                status: STATUS_FUNCIONARIO_PERIODICIDADE_EPI_ATIVA,
                leaveReturnDate: null
            });

            await gerenciarPeriodicidadeEpiFuncionarioService.sincronizarPorMudancaStatus(
                statusAnterior,
                funcionarioAtualizado.status,
                funcionario.id
            );

            revertidos += 1;
        }

        return revertidos;
    }
}

export default new ReverterAfastamentosExpiradosService();
