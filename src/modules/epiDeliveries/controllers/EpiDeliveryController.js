import createEpiDeliveryService from '../services/CreateEpiDeliveryService.js';
import epiDeliveryRepository from '../repositories/EpiDeliveryRepository.js';

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

    async listByEmployee(req, res, next) {
        try {
            const { employeeId } = req.params;

            const deliveries = await epiDeliveryRepository.findByEmployeeId(employeeId);

            return res.status(200).json(deliveries);
        } catch (error) {
            next(error);
        }
    }
}

export default new EpiDeliveryController();
