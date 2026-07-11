import { jest } from '@jest/globals';

const epiDeliveryRepositoryMock = {
    findByEmployeeId: jest.fn()
};

const employeeRepositoryMock = {
    findById: jest.fn()
};

jest.unstable_mockModule('../repositories/EpiDeliveryRepository.js', () => ({
    default: epiDeliveryRepositoryMock
}));

jest.unstable_mockModule('../../employees/repositories/EmployeeRepository.js', () => ({
    default: employeeRepositoryMock
}));

const listEpiDeliveriesByEmployeeService = (await import('./ListEpiDeliveriesByEmployeeService.js')).default;

describe('ListEpiDeliveriesByEmployeeService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve rejeitar identificador nulo', async () => {
        await expect(listEpiDeliveriesByEmployeeService.execute(null)).rejects.toMatchObject({
            statusCode: 400
        });
    });

    it('deve rejeitar identificador vazio', async () => {
        await expect(listEpiDeliveriesByEmployeeService.execute('   ')).rejects.toMatchObject({
            statusCode: 400
        });
    });

    it('deve retornar entregas do funcionário ativo', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({ id: 'emp1', roleId: 'r1', deletedAt: null });
        epiDeliveryRepositoryMock.findByEmployeeId.mockResolvedValue([{ id: 'd1' }, { id: 'd2' }]);

        const resultado = await listEpiDeliveriesByEmployeeService.execute('emp1');

        expect(resultado).toHaveLength(2);
        expect(employeeRepositoryMock.findById).toHaveBeenCalledWith('emp1');
        expect(epiDeliveryRepositoryMock.findByEmployeeId).toHaveBeenCalledWith('emp1');
    });

    it('deve normalizar espaços no identificador do funcionário', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({ id: 'emp1', deletedAt: null });
        epiDeliveryRepositoryMock.findByEmployeeId.mockResolvedValue([]);

        await listEpiDeliveriesByEmployeeService.execute('  emp1  ');

        expect(employeeRepositoryMock.findById).toHaveBeenCalledWith('emp1');
    });

    it('deve retornar array vazio quando não houver entregas registradas', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({ id: 'emp1', deletedAt: null });
        epiDeliveryRepositoryMock.findByEmployeeId.mockResolvedValue([]);

        const resultado = await listEpiDeliveriesByEmployeeService.execute('emp1');

        expect(resultado).toEqual([]);
    });

    it('deve lançar 404 quando funcionário não existir', async () => {
        employeeRepositoryMock.findById.mockResolvedValue(null);

        await expect(listEpiDeliveriesByEmployeeService.execute('inexistente')).rejects.toMatchObject({
            message: 'Funcionário não encontrado.',
            statusCode: 404
        });
    });

    it('deve lançar 404 quando funcionário estiver excluído (soft delete)', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({
            id: 'emp1',
            deletedAt: new Date()
        });

        await expect(listEpiDeliveriesByEmployeeService.execute('emp1')).rejects.toMatchObject({
            statusCode: 404
        });
    });
});
