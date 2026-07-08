import { criarErroNaoEncontrado } from '../../../shared/errors/criarErroHttp.js';
import employeeRepository from '../repositories/EmployeeRepository.js';
import { montarParesExportacaoFichaFuncionario } from '../utils/montarParesExportacaoFichaFuncionario.js';
import planilhaFuncionarioProvider from '../../../shared/providers/PlanilhaFuncionarioProvider/PlanilhaFuncionarioProvider.js';

class ExportarFuncionarioCompletoPlanilhaService {
    /**
     * @param {string} identificadorFuncionario
     * @returns {Promise<{ buffer: Buffer, nomeArquivo: string }>}
     */
    async execute(identificadorFuncionario) {
        const funcionario = await employeeRepository.findByIdParaExportacaoFicha(
            identificadorFuncionario
        );

        if (!funcionario) {
            throw criarErroNaoEncontrado('Funcionário não encontrado');
        }

        const paresCampoValor = montarParesExportacaoFichaFuncionario(funcionario);
        const buffer = await planilhaFuncionarioProvider.gerarPlanilhaFichaFuncionario(
            'Funcionário',
            paresCampoValor
        );

        const nomeSanitizado = planilhaFuncionarioProvider.sanitizarNomeArquivo(funcionario.name);
        const nomeArquivo = `funcionario-${nomeSanitizado || identificadorFuncionario}.xlsx`;

        return { buffer, nomeArquivo };
    }
}

export default new ExportarFuncionarioCompletoPlanilhaService();
