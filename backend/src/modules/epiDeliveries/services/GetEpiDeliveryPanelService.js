import epiDeliveryRepository from '../repositories/EpiDeliveryRepository.js';
import {
    montarEpisVencidosPorFuncionarios,
    montarResumoContagemEpis,
    montarSituacaoEpisFuncionario
} from '../utils/situacaoEpiEntrega.js';

class GetEpiDeliveryPanelService {
    async execute() {
        const funcionarios = await epiDeliveryRepository.findFuncionariosAtivos();
        const funcionariosComEpisNoCargo = funcionarios.filter(
            (funcionario) => (funcionario.role?.roleEpis || []).length > 0
        );

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
            episVencidos: montarEpisVencidosPorFuncionarios(funcionariosComEpisNoCargo)
        };
    }
}

export default new GetEpiDeliveryPanelService();
