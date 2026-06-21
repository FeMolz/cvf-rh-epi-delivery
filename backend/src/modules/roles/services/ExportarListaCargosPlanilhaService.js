import planilhaCargoProvider from '../../../shared/providers/PlanilhaCargoProvider/PlanilhaCargoProvider.js';
import roleRepository from '../repositories/RoleRepository.js';
import { montarLinhasExportacaoListaCargos } from '../utils/montarLinhasExportacaoListaCargos.js';

class ExportarListaCargosPlanilhaService {
    /**
     * @param {{ apenasInativos?: boolean }} [opcoes]
     */
    async execute({ apenasInativos = false } = {}) {
        const cargos = await roleRepository.findAll({
            apenasInativos,
            incluirInativos: apenasInativos
        });

        const linhas = montarLinhasExportacaoListaCargos(cargos);
        const buffer = await planilhaCargoProvider.gerarPlanilhaListaCargos(linhas);
        const dataAtual = new Date().toISOString().slice(0, 10);
        const sufixo = apenasInativos ? 'inativos' : 'ativos';

        return {
            buffer,
            nomeArquivo: `cargos-${sufixo}-${dataAtual}.xlsx`
        };
    }
}

export default new ExportarListaCargosPlanilhaService();
