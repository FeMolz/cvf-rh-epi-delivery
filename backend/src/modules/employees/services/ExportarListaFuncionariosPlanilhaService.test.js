import { jest } from '@jest/globals';

const employeeRepositoryMock = {
    findManyParaExportacaoLista: jest.fn(),
    findManyParaExportacaoFicha: jest.fn()
};

const planilhaFuncionarioProviderMock = {
    gerarPlanilhaListaFuncionarios: jest.fn(),
    gerarPlanilhaFichasFuncionarios: jest.fn(),
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
        }, { incluirDesligados: false });
        expect(resultado.buffer).toBeInstanceOf(Buffer);
        expect(resultado.nomeArquivo).toMatch(/^funcionarios-ativos-/);
    });

    it('deve exportar funcionários filtrados por empresa', async () => {
        employeeRepositoryMock.findManyParaExportacaoLista.mockResolvedValue([]);
        planilhaFuncionarioProviderMock.gerarPlanilhaListaFuncionarios.mockResolvedValue(
            Buffer.from('xlsx')
        );

        await exportarListaFuncionariosPlanilhaService.execute({
            filtro: 'todos',
            companyId: 'empresa-1'
        });

        expect(employeeRepositoryMock.findManyParaExportacaoLista).toHaveBeenCalledWith({
            companyId: 'empresa-1'
        }, { incluirDesligados: true });
    });

    it('deve exportar funcionários desligados quando filtro for todos', async () => {
        employeeRepositoryMock.findManyParaExportacaoLista.mockResolvedValue([
            {
                name: 'João',
                status: 'DESLIGADO',
                resignationDate: new Date('2024-06-01'),
                role: { name: 'Analista' },
                setor: { nome: 'TI' }
            }
        ]);
        planilhaFuncionarioProviderMock.gerarPlanilhaListaFuncionarios.mockResolvedValue(
            Buffer.from('xlsx')
        );

        await exportarListaFuncionariosPlanilhaService.execute({ filtro: 'todos' });

        expect(employeeRepositoryMock.findManyParaExportacaoLista).toHaveBeenCalledWith(
            {},
            { incluirDesligados: true }
        );
    });

    it('deve exportar ficha de funcionário desligado quando selecionado por id', async () => {
        employeeRepositoryMock.findManyParaExportacaoFicha.mockResolvedValue([
            {
                id: 'func-desligado',
                name: 'Carlos Demitido',
                cpf: '529.982.247-25',
                email: 'carlos@empresa.com',
                telefone: '(11) 98888-7777',
                birthDate: new Date('1990-01-01'),
                status: 'DESLIGADO',
                admissionDate: new Date('2020-01-01'),
                resignationDate: new Date('2024-06-01'),
                deletedAt: new Date('2024-06-01'),
                role: { name: 'Analista' },
                company: { name: 'Empresa 01' },
                setor: { nome: 'TI' },
                valeTransporte: true,
                valeAlimentacao: false,
                planoSaude: true
            }
        ]);
        planilhaFuncionarioProviderMock.gerarPlanilhaFichasFuncionarios.mockResolvedValue(
            Buffer.from('xlsx')
        );

        const resultado = await exportarListaFuncionariosPlanilhaService.execute({
            ids: ['func-desligado']
        });

        expect(employeeRepositoryMock.findManyParaExportacaoFicha).toHaveBeenCalledWith([
            'func-desligado'
        ]);
        expect(planilhaFuncionarioProviderMock.gerarPlanilhaFichasFuncionarios).toHaveBeenCalled();
        expect(resultado.nomeArquivo).toBe('funcionario-maria-silva.xlsx');
    });

    it('deve exportar ficha completa dos funcionários selecionados', async () => {
        employeeRepositoryMock.findManyParaExportacaoFicha.mockResolvedValue([
            {
                id: 'func-1',
                name: 'Maria Silva',
                cpf: '529.982.247-25',
                email: 'maria@empresa.com',
                telefone: '(11) 98888-7777',
                birthDate: new Date('1990-01-01'),
                status: 'ATIVO',
                admissionDate: new Date('2020-01-01'),
                resignationDate: null,
                role: { name: 'Analista' },
                company: { name: 'Empresa 01' },
                setor: { nome: 'TI' },
                valeTransporte: true,
                valeAlimentacao: false,
                planoSaude: true
            },
            {
                id: 'func-2',
                name: 'João Souza',
                cpf: '111.444.777-35',
                email: 'joao@empresa.com',
                telefone: '(11) 97777-6666',
                birthDate: new Date('1988-05-10'),
                status: 'ATIVO',
                admissionDate: new Date('2019-03-15'),
                resignationDate: null,
                role: { name: 'Técnico' },
                company: { name: 'Empresa 01' },
                setor: { nome: 'Operações' },
                valeTransporte: false,
                valeAlimentacao: true,
                planoSaude: false
            }
        ]);
        planilhaFuncionarioProviderMock.gerarPlanilhaFichasFuncionarios.mockResolvedValue(
            Buffer.from('xlsx')
        );

        const resultado = await exportarListaFuncionariosPlanilhaService.execute({
            filtro: 'todos',
            ids: ['func-1', 'func-2']
        });

        expect(employeeRepositoryMock.findManyParaExportacaoFicha).toHaveBeenCalledWith([
            'func-1',
            'func-2'
        ]);
        expect(planilhaFuncionarioProviderMock.gerarPlanilhaFichasFuncionarios).toHaveBeenCalled();
        expect(employeeRepositoryMock.findManyParaExportacaoLista).not.toHaveBeenCalled();
        expect(resultado.nomeArquivo).toMatch(/^funcionarios-selecionados-/);
    });

    it('deve exportar ficha completa de um único funcionário selecionado', async () => {
        employeeRepositoryMock.findManyParaExportacaoFicha.mockResolvedValue([
            {
                id: 'func-1',
                name: 'Maria Silva',
                cpf: '529.982.247-25',
                email: 'maria@empresa.com',
                telefone: '(11) 98888-7777',
                birthDate: new Date('1990-01-01'),
                status: 'ATIVO',
                admissionDate: new Date('2020-01-01'),
                resignationDate: null,
                role: { name: 'Analista' },
                company: { name: 'Empresa 01' },
                setor: { nome: 'TI' },
                valeTransporte: true,
                valeAlimentacao: false,
                planoSaude: true
            }
        ]);
        planilhaFuncionarioProviderMock.gerarPlanilhaFichasFuncionarios.mockResolvedValue(
            Buffer.from('xlsx')
        );

        const resultado = await exportarListaFuncionariosPlanilhaService.execute({
            ids: ['func-1']
        });

        expect(planilhaFuncionarioProviderMock.gerarPlanilhaFichasFuncionarios).toHaveBeenCalledWith([
            expect.objectContaining({
                tituloBase: 'Funcionário',
                paresCampoValor: expect.arrayContaining([
                    expect.objectContaining({ campo: 'Nome', valor: 'Maria Silva' })
                ])
            })
        ]);
        expect(resultado.nomeArquivo).toBe('funcionario-maria-silva.xlsx');
    });

    it('deve rejeitar filtro inválido', async () => {
        await expect(
            exportarListaFuncionariosPlanilhaService.execute({ filtro: 'invalido' })
        ).rejects.toMatchObject({
            statusCode: 400
        });
    });

    it('deve exportar lista inativos sem companyId', async () => {
        employeeRepositoryMock.findManyParaExportacaoLista.mockResolvedValue([]);
        planilhaFuncionarioProviderMock.gerarPlanilhaListaFuncionarios.mockResolvedValue(
            Buffer.from('xlsx')
        );

        const resultado = await exportarListaFuncionariosPlanilhaService.execute({
            filtro: 'inativos'
        });

        expect(employeeRepositoryMock.findManyParaExportacaoLista).toHaveBeenCalledWith(
            { status: { in: ['INATIVO', 'DESLIGADO', 'RESCINDIDO', 'APOSENTADO'] } },
            { incluirDesligados: true }
        );
        expect(resultado.nomeArquivo).toMatch(/^funcionarios-inativos-/);
    });

    it('deve exportar todos sem companyId com sufixo empresa-completa', async () => {
        employeeRepositoryMock.findManyParaExportacaoLista.mockResolvedValue([]);
        planilhaFuncionarioProviderMock.gerarPlanilhaListaFuncionarios.mockResolvedValue(
            Buffer.from('xlsx')
        );

        const resultado = await exportarListaFuncionariosPlanilhaService.execute({
            filtro: 'todos'
        });

        expect(resultado.nomeArquivo).toMatch(/^funcionarios-empresa-completa-/);
    });

    it('deve normalizar ids informados como string separada por vírgula', async () => {
        employeeRepositoryMock.findManyParaExportacaoFicha.mockResolvedValue([
            {
                id: 'func-1',
                name: 'Maria Silva',
                cpf: '529.982.247-25',
                email: 'maria@empresa.com',
                telefone: '(11) 98888-7777',
                birthDate: new Date('1990-01-01'),
                status: 'ATIVO',
                admissionDate: new Date('2020-01-01'),
                resignationDate: null,
                role: { name: 'Analista' },
                company: { name: 'Empresa 01' },
                setor: { nome: 'TI' },
                valeTransporte: true,
                valeAlimentacao: false,
                planoSaude: true
            }
        ]);
        planilhaFuncionarioProviderMock.gerarPlanilhaFichasFuncionarios.mockResolvedValue(
            Buffer.from('xlsx')
        );

        await exportarListaFuncionariosPlanilhaService.execute({
            ids: 'func-1, func-1 , func-2'
        });

        expect(employeeRepositoryMock.findManyParaExportacaoFicha).toHaveBeenCalledWith([
            'func-1',
            'func-2'
        ]);
    });

    it('deve retornar NOT_FOUND quando nenhum funcionário for encontrado por ids', async () => {
        employeeRepositoryMock.findManyParaExportacaoFicha.mockResolvedValue([]);

        await expect(
            exportarListaFuncionariosPlanilhaService.execute({ ids: ['inexistente'] })
        ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('deve usar id no nome do arquivo quando sanitização retornar vazio', async () => {
        employeeRepositoryMock.findManyParaExportacaoFicha.mockResolvedValue([
            {
                id: 'func-1',
                name: 'Maria Silva',
                cpf: '529.982.247-25',
                email: 'maria@empresa.com',
                telefone: '(11) 98888-7777',
                birthDate: new Date('1990-01-01'),
                status: 'ATIVO',
                admissionDate: new Date('2020-01-01'),
                resignationDate: null,
                role: { name: 'Analista' },
                company: { name: 'Empresa 01' },
                setor: { nome: 'TI' },
                valeTransporte: true,
                valeAlimentacao: false,
                planoSaude: true
            }
        ]);
        planilhaFuncionarioProviderMock.sanitizarNomeArquivo.mockReturnValueOnce('');
        planilhaFuncionarioProviderMock.gerarPlanilhaFichasFuncionarios.mockResolvedValue(
            Buffer.from('xlsx')
        );

        const resultado = await exportarListaFuncionariosPlanilhaService.execute({
            ids: ['func-1']
        });

        expect(resultado.nomeArquivo).toBe('funcionario-func-1.xlsx');
    });

    it('deve usar nome do funcionário como título quando exportar múltiplas fichas', async () => {
        employeeRepositoryMock.findManyParaExportacaoFicha.mockResolvedValue([
            {
                id: 'func-1',
                name: 'Maria Silva',
                cpf: '529.982.247-25',
                email: 'maria@empresa.com',
                telefone: '(11) 98888-7777',
                birthDate: new Date('1990-01-01'),
                status: 'ATIVO',
                admissionDate: new Date('2020-01-01'),
                resignationDate: null,
                role: { name: 'Analista' },
                company: { name: 'Empresa 01' },
                setor: { nome: 'TI' },
                valeTransporte: true,
                valeAlimentacao: false,
                planoSaude: true
            },
            {
                id: 'func-2',
                name: '',
                cpf: '111.444.777-35',
                email: 'joao@empresa.com',
                telefone: '(11) 97777-6666',
                birthDate: new Date('1988-05-10'),
                status: 'ATIVO',
                admissionDate: new Date('2019-03-15'),
                resignationDate: null,
                role: { name: 'Técnico' },
                company: { name: 'Empresa 01' },
                setor: { nome: 'Operações' },
                valeTransporte: false,
                valeAlimentacao: true,
                planoSaude: false
            }
        ]);
        planilhaFuncionarioProviderMock.gerarPlanilhaFichasFuncionarios.mockResolvedValue(
            Buffer.from('xlsx')
        );

        await exportarListaFuncionariosPlanilhaService.execute({
            ids: ['func-1', 'func-2']
        });

        expect(planilhaFuncionarioProviderMock.gerarPlanilhaFichasFuncionarios).toHaveBeenCalledWith([
            expect.objectContaining({ tituloBase: 'Maria Silva' }),
            expect.objectContaining({ tituloBase: 'Funcionário' })
        ]);
    });
});
