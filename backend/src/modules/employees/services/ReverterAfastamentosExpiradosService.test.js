import { jest } from '@jest/globals';

const employeeRepositoryMock = {
    findManyComAfastamentoTemporarioExpirado: jest.fn(),
    update: jest.fn()
};

jest.unstable_mockModule('../repositories/EmployeeRepository.js', () => ({
    default: employeeRepositoryMock
}));

const gerenciarPeriodicidadeEpiFuncionarioServiceMock = {
    sincronizarPorMudancaStatus: jest.fn()
};

jest.unstable_mockModule('../../epiDeliveries/services/GerenciarPeriodicidadeEpiFuncionarioService.js', () => ({
    default: gerenciarPeriodicidadeEpiFuncionarioServiceMock
}));

const reverterAfastamentosExpiradosService = (
    await import('./ReverterAfastamentosExpiradosService.js')
).default;

describe('ReverterAfastamentosExpiradosService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve reativar funcionários com data de retorno vencida e retomar periodicidade', async () => {
        employeeRepositoryMock.findManyComAfastamentoTemporarioExpirado.mockResolvedValue([
            { id: 'func-1', status: 'FERIAS' }
        ]);
        employeeRepositoryMock.update.mockResolvedValue({ id: 'func-1', status: 'ATIVO' });

        const quantidade = await reverterAfastamentosExpiradosService.execute(new Date('2026-06-22'));

        expect(quantidade).toBe(1);
        expect(employeeRepositoryMock.update).toHaveBeenCalledWith('func-1', {
            status: 'ATIVO',
            leaveReturnDate: null
        });
        expect(gerenciarPeriodicidadeEpiFuncionarioServiceMock.sincronizarPorMudancaStatus).toHaveBeenCalledWith(
            'FERIAS',
            'ATIVO',
            'func-1'
        );
    });

    it('deve retornar zero quando não houver afastamentos expirados', async () => {
        employeeRepositoryMock.findManyComAfastamentoTemporarioExpirado.mockResolvedValue([]);

        const quantidade = await reverterAfastamentosExpiradosService.execute();

        expect(quantidade).toBe(0);
        expect(employeeRepositoryMock.update).not.toHaveBeenCalled();
    });

    it('deve retornar zero quando data de referência for inválida', async () => {
        const quantidade = await reverterAfastamentosExpiradosService.execute('data-invalida');

        expect(quantidade).toBe(0);
        expect(employeeRepositoryMock.findManyComAfastamentoTemporarioExpirado).not.toHaveBeenCalled();
    });
});
