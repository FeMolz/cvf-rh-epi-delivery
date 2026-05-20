import { jest } from '@jest/globals';

const employeeRepositoryMock = {
    findByIdParaExportacaoFicha: jest.fn()
};

const planilhaFuncionarioProviderMock = {
    gerarPlanilhaFichaFuncionario: jest.fn(),
    sanitizarNomeArquivo: jest.fn(() => 'maria-silva')
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

const exportarFuncionarioCompletoPlanilhaService = (
    await import('./ExportarFuncionarioCompletoPlanilhaService.js')
).default;

describe('ExportarFuncionarioCompletoPlanilhaService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve exportar ficha completa do funcionário', async () => {
        employeeRepositoryMock.findByIdParaExportacaoFicha.mockResolvedValue({
            id: '1',
            name: 'Maria Silva',
            cpf: '529.982.247-25',
            email: 'maria@empresa.com',
            telefone: '(11) 98888-7777',
            birthDate: new Date('1990-01-01'),
            status: 'ATIVO',
            admissionDate: new Date('2020-01-01'),
            resignationDate: null,
            deletedAt: null,
            role: { name: 'Analista' },
            company: { name: 'Empresa 01' },
            setor: { nome: 'TI' },
            valeTransporte: true,
            valeAlimentacao: false,
            planoSaude: true
        });
        planilhaFuncionarioProviderMock.gerarPlanilhaFichaFuncionario.mockResolvedValue(
            Buffer.from('xlsx')
        );

        const resultado = await exportarFuncionarioCompletoPlanilhaService.execute('1');

        expect(planilhaFuncionarioProviderMock.gerarPlanilhaFichaFuncionario).toHaveBeenCalled();
        expect(resultado.nomeArquivo).toBe('funcionario-maria-silva.xlsx');
    });

    it('deve retornar NOT_FOUND quando funcionário não existe', async () => {
        employeeRepositoryMock.findByIdParaExportacaoFicha.mockResolvedValue(null);

        await expect(exportarFuncionarioCompletoPlanilhaService.execute('99')).rejects.toMatchObject(
            { code: 'NOT_FOUND' }
        );
    });
});
