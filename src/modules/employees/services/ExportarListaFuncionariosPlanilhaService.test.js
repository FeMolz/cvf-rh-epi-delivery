import { jest } from '@jest/globals';

const employeeRepositoryMock = {
    findManyParaExportacaoLista: jest.fn()
};

const planilhaFuncionarioProviderMock = {
    gerarPlanilhaListaFuncionarios: jest.fn()
};

jest.unstable_mockModule('../repositories/EmployeeRepository.js', () => ({
    default: employeeRepositoryMock
}));

jest.unstable_mockModule(
    '../../../shared/providers/PlanilhaFuncionarioProvider/PlanilhaFuncionarioProvider.js',
    () => ({
        default: planilhaFuncionarioProviderMock
    })
);

const exportarListaFuncionariosPlanilhaService = (
    await import('./ExportarListaFuncionariosPlanilhaService.js')
).default;

describe('ExportarListaFuncionariosPlanilhaService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve exportar funcionários ativos por padrão', async () => {
        employeeRepositoryMock.findManyParaExportacaoLista.mockResolvedValue([
            {
                name: 'Maria',
                status: 'ATIVO',
                resignationDate: null,
                role: { name: 'Analista' },
                setor: { nome: 'TI' }
            }
        ]);
        planilhaFuncionarioProviderMock.gerarPlanilhaListaFuncionarios.mockResolvedValue(
            Buffer.from('xlsx')
        );

        const resultado = await exportarListaFuncionariosPlanilhaService.execute();

        expect(employeeRepositoryMock.findManyParaExportacaoLista).toHaveBeenCalledWith({
            status: { in: ['ATIVO'] }
        });
        expect(resultado.buffer).toBeInstanceOf(Buffer);
        expect(resultado.nomeArquivo).toMatch(/^funcionarios-ativos-/);
    });

    it('deve rejeitar filtro inválido', async () => {
        await expect(exportarListaFuncionariosPlanilhaService.execute('invalido')).rejects.toMatchObject({
            statusCode: 400
        });
    });
});
