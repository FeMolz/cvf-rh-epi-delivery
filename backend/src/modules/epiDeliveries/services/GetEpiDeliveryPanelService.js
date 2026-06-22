import epiDeliveryRepository from '../repositories/EpiDeliveryRepository.js';
import {
    montarEpisVencidosPorFuncionarios,
    montarResumoContagemEpis,
    montarSituacaoEpisFuncionario
} from '../utils/situacaoEpiEntrega.js';

class GetEpiDeliveryPanelService {
    async execute() {
        const funcionarios = await epiDeliveryRepository.findFuncionariosAtivosComEpisNoCargo();

        return {
            funcionariosElegiveis: funcionarios.map((funcionario) => {
                const epis = montarSituacaoEpisFuncionario(funcionario);

                return {
                    id: funcionario.id,
                    name: funcionario.name,
                    roleId: funcionario.roleId,
                    roleName: funcionario.role?.name || '—',
                    resumoEpis: montarResumoContagemEpis(epis)
                };
            }),
            episVencidos: montarEpisVencidosPorFuncionarios(funcionarios)
        };
    }
}

export default new GetEpiDeliveryPanelService();
