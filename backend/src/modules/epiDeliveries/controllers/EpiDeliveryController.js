import createEpiDeliveryService from '../services/CreateEpiDeliveryService.js';
import listEpiDeliveriesByEmployeeService from '../services/ListEpiDeliveriesByEmployeeService.js';

class EpiDeliveryController {
    async create(requisicao, resposta, proximo) {
        try {
            const { employeeId, caNumbers } = requisicao.body;
            const deliveredById = requisicao.user.id;

            const resultado = await createEpiDeliveryService.execute({
                employeeId,
                caNumbers,
                deliveredById
            });

            return resposta.status(201).json(resultado);
        } catch (erro) {
            return proximo(erro);
        }
    }

    async listByEmployee(requisicao, resposta, proximo) {
        try {
            const entregas = await listEpiDeliveriesByEmployeeService.execute(
                requisicao.params.employeeId
            );

            return resposta.status(200).json(entregas);
        } catch (erro) {
            return proximo(erro);
        }
    }
}

export default new EpiDeliveryController();
