import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';
import epiDeliveryRepository from '../repositories/EpiDeliveryRepository.js';
import employeeRepository from '../../employees/repositories/EmployeeRepository.js';
import fetchEpiFromApiService from '../../epis/services/FetchEpiFromApiService.js';
import gerenciarPeriodicidadeEpiFuncionarioService from './GerenciarPeriodicidadeEpiFuncionarioService.js';
import {
    MENSAGEM_FALHA_PERSISTIR_ENTREGAS,
    MENSAGEM_FUNCIONARIO_INELEGIVEL_ENTREGA_EPI,
    MENSAGEM_FUNCIONARIO_NAO_ENCONTRADO
} from '../constants/entregaEpiConstantes.js';

class CreateEpiDeliveryService {
    async execute({ employeeId, caNumbers, deliveredById }) {
        if (!employeeId || !caNumbers || !Array.isArray(caNumbers) || caNumbers.length === 0 || !deliveredById) {
            throw criarErroHttp('employeeId, caNumbers (array) e deliveredById são obrigatórios.');
        }

        const identificadorFuncionario = String(employeeId).trim();
        const funcionario = await employeeRepository.findById(identificadorFuncionario);

        if (!funcionario || funcionario.deletedAt) {
            throw criarErroHttp(MENSAGEM_FUNCIONARIO_NAO_ENCONTRADO, 404);
        }

        if (
            !gerenciarPeriodicidadeEpiFuncionarioService.funcionarioPossuiPeriodicidadeEpiAtiva(
                funcionario.status
            )
        ) {
            throw criarErroHttp(MENSAGEM_FUNCIONARIO_INELEGIVEL_ENTREGA_EPI);
        }

        // 2. Buscar as regras de periodicidade para o cargo do funcionário
        const roleEpis = await epiDeliveryRepository.findRoleEpisByRoleId(funcionario.roleId);

        const deliveriesData = [];
        const currentDate = new Date();

        // 3. Processar cada CA do array
        for (const caNumber of caNumbers) {
            // Buscar ou salvar o EPI localmente usando a integração
            const epi = await fetchEpiFromApiService.execute(caNumber);

            // Verificar se há vínculo de periodicidade para este EPI no cargo
            const roleEpiMatch = roleEpis.find(re => re.epiId === epi.id);

            let nextDueDate = null;
            if (roleEpiMatch && roleEpiMatch.periodicityDays > 0) {
                const dueDate = new Date(currentDate);
                dueDate.setDate(dueDate.getDate() + roleEpiMatch.periodicityDays);
                nextDueDate = dueDate;
            }

            deliveriesData.push({
                employeeId: funcionario.id,
                epiId: epi.id,
                deliveredById: deliveredById,
                deliveryDate: currentDate,
                nextDueDate: nextDueDate
            });
        }

        const resultadoPersistencia = await epiDeliveryRepository.createBatch(deliveriesData);

        if (resultadoPersistencia.count !== deliveriesData.length) {
            throw criarErroHttp(MENSAGEM_FALHA_PERSISTIR_ENTREGAS, 500);
        }

        return {
            message: `${resultadoPersistencia.count} EPI(s) entregue(s) com sucesso.`,
            count: resultadoPersistencia.count
        };
    }
}

export default new CreateEpiDeliveryService();
