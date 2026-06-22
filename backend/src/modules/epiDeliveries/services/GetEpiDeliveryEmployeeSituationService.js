import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';
import { MENSAGEM_FUNCIONARIO_NAO_ENCONTRADO } from '../constants/entregaEpiConstantes.js';
import epiDeliveryRepository from '../repositories/EpiDeliveryRepository.js';
import { montarSituacaoEpisFuncionario } from '../utils/situacaoEpiEntrega.js';

class GetEpiDeliveryEmployeeSituationService {
    async execute(employeeId) {
        const identificador = String(employeeId || '').trim();

        if (!identificador) {
            throw criarErroHttp('O identificador do funcionário é obrigatório.');
        }

        const funcionario =
            await epiDeliveryRepository.findFuncionarioAtivoComEpisNoCargoPorId(identificador);

        if (!funcionario) {
            throw criarErroHttp(MENSAGEM_FUNCIONARIO_NAO_ENCONTRADO, 404);
        }

        return {
            employee: {
                id: funcionario.id,
                name: funcionario.name,
                roleId: funcionario.roleId,
                roleName: funcionario.role?.name || '—'
            },
            epis: montarSituacaoEpisFuncionario(funcionario)
        };
    }
}

export default new GetEpiDeliveryEmployeeSituationService();
