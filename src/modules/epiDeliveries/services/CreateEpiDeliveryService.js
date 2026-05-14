import epiDeliveryRepository from '../repositories/EpiDeliveryRepository.js';
import fetchEpiFromApiService from '../../epis/services/FetchEpiFromApiService.js';

class CreateEpiDeliveryService {
    async execute({ employeeId, caNumbers, deliveredById }) {
        if (!employeeId || !caNumbers || !Array.isArray(caNumbers) || caNumbers.length === 0 || !deliveredById) {
            throw new Error('employeeId, caNumbers (array) e deliveredById são obrigatórios.');
        }

        // 1. Validar se o funcionário existe via repositório
        const employee = await epiDeliveryRepository.findEmployeeById(employeeId);

        if (!employee) {
            throw new Error('Funcionário não encontrado.');
        }

        // 2. Buscar as regras de periodicidade para o cargo do funcionário
        const roleEpis = await epiDeliveryRepository.findRoleEpisByRoleId(employee.roleId);

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
                employeeId: employee.id,
                epiId: epi.id,
                deliveredById: deliveredById,
                deliveryDate: currentDate,
                nextDueDate: nextDueDate
            });
        }

        // 4. Salvar todas as entregas em lote no banco
        await epiDeliveryRepository.createBatch(deliveriesData);

        return {
            message: `${deliveriesData.length} EPI(s) entregue(s) com sucesso.`,
            count: deliveriesData.length
        };
    }
}

export default new CreateEpiDeliveryService();
