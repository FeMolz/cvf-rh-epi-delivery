import createEpiDeliveryService from '../services/CreateEpiDeliveryService.js';
import listEpiDeliveriesByEmployeeService from '../services/ListEpiDeliveriesByEmployeeService.js';

class EpiDeliveryController {
    async create(req, res, next) {
        try {
            const { employeeId, caNumbers } = req.body;
            // Pegamos o ID do usuário que está fazendo a requisição
            const deliveredById = req.user.id;

            const result = await createEpiDeliveryService.execute({
                employeeId,
                caNumbers,
                deliveredById
            });

            return res.status(201).json(result);
        } catch (error) {
            if (error.message.includes('obrigatórios') || error.message.includes('não encontrado')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    async listByEmployee(requisicao, resposta, proximo) {
        try {
            const entregas = await listEpiDeliveriesByEmployeeService.execute(
                requisicao.params.employeeId
            );

            return resposta.status(200).json(entregas);
        } catch (erro) {
            if (erro.statusCode === 400 || erro.statusCode === 404) {
                return resposta.status(erro.statusCode).json({ error: erro.message });
            }
            return proximo(erro);
        }
    }
}

export default new EpiDeliveryController();
