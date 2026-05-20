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

        if (!funcionario || funcionario.deletedAt) {
            const erro = new Error('Funcionário não encontrado');
            erro.code = 'NOT_FOUND';
            throw erro;
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
