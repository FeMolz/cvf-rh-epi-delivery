import createEpiDeliveryService from '../services/CreateEpiDeliveryService.js';
import listEpiDeliveriesByEmployeeService from '../services/ListEpiDeliveriesByEmployeeService.js';
import getEpiDeliveryPanelService from '../services/GetEpiDeliveryPanelService.js';
import getEpiDeliveryEmployeeSituationService from '../services/GetEpiDeliveryEmployeeSituationService.js';

class EpiDeliveryController {
    async create(requisicao, resposta, proximo) {
        try {
            const { employeeId, caNumbers, deliveryDate } = requisicao.body;
            const deliveredById = requisicao.user.id;

            const resultado = await createEpiDeliveryService.execute({
                employeeId,
                caNumbers,
                deliveredById,
                deliveryDate
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

    async getPanel(requisicao, resposta, proximo) {
        try {
            const painel = await getEpiDeliveryPanelService.execute();
            return resposta.status(200).json(painel);
        } catch (erro) {
            return proximo(erro);
        }
    }

    async getEmployeeSituation(requisicao, resposta, proximo) {
        try {
            const situacao = await getEpiDeliveryEmployeeSituationService.execute(
                requisicao.params.employeeId
            );

            return resposta.status(200).json(situacao);
        } catch (erro) {
            return proximo(erro);
        }
    }
}

export default new EpiDeliveryController();
