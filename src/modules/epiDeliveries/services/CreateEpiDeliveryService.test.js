import { jest } from '@jest/globals';

const epiDeliveryRepositoryMock = {
    findRoleEpisByRoleId: jest.fn(),
    createBatch: jest.fn()
};

const employeeRepositoryMock = {
    findById: jest.fn()
};

const fetchEpiFromApiServiceMock = {
    execute: jest.fn()
};

jest.unstable_mockModule('../repositories/EpiDeliveryRepository.js', () => ({
    default: epiDeliveryRepositoryMock
}));

jest.unstable_mockModule('../../employees/repositories/EmployeeRepository.js', () => ({
    default: employeeRepositoryMock
}));

jest.unstable_mockModule('../../epis/services/FetchEpiFromApiService.js', () => ({
    default: fetchEpiFromApiServiceMock
}));

const createEpiDeliveryService = (await import('./CreateEpiDeliveryService.js')).default;

describe('CreateEpiDeliveryService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should throw error if fields are missing', async () => {
        await expect(createEpiDeliveryService.execute({ employeeId: '1' })).rejects.toThrow('employeeId, caNumbers (array) e deliveredById são obrigatórios.');
    });

    it('should throw error if caNumbers is empty array', async () => {
        await expect(createEpiDeliveryService.execute({ employeeId: '1', caNumbers: [], deliveredById: '2' })).rejects.toThrow('employeeId, caNumbers (array) e deliveredById são obrigatórios.');
    });

    it('should throw error if employee does not exist', async () => {
        employeeRepositoryMock.findById.mockResolvedValue(null);
        await expect(createEpiDeliveryService.execute({ employeeId: '1', caNumbers: ['11070'], deliveredById: '2' })).rejects.toThrow('Funcionário não encontrado.');
    });

    it('should process multiple deliveries with correct periodicity', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({ id: '1', roleId: 'role1', deletedAt: null });
        epiDeliveryRepositoryMock.findRoleEpisByRoleId.mockResolvedValue([{ epiId: 'epi1', periodicityDays: 30 }]);
        
        fetchEpiFromApiServiceMock.execute.mockResolvedValueOnce({ id: 'epi1' }); // Found in role
        fetchEpiFromApiServiceMock.execute.mockResolvedValueOnce({ id: 'epi2' }); // Not in role
        
        epiDeliveryRepositoryMock.createBatch.mockResolvedValue({ count: 2 });

        const result = await createEpiDeliveryService.execute({ employeeId: '1', caNumbers: ['11070', '4280'], deliveredById: '2' });
        
        expect(result.count).toBe(2);
        
        const createBatchArgs = epiDeliveryRepositoryMock.createBatch.mock.calls[0][0];
        expect(createBatchArgs.length).toBe(2);
        
        // O primeiro tem data de vencimento porque periodicityDays > 0
        expect(createBatchArgs[0].nextDueDate).not.toBeNull();
        // O segundo não tem porque não tem vinculo no cargo
        expect(createBatchArgs[1].nextDueDate).toBeNull();
    });

    it('deve falhar quando createMany não persistir todas as entregas', async () => {
        employeeRepositoryMock.findById.mockResolvedValue({ id: '1', roleId: 'role1', deletedAt: null });
        epiDeliveryRepositoryMock.findRoleEpisByRoleId.mockResolvedValue([]);
        fetchEpiFromApiServiceMock.execute.mockResolvedValue({ id: 'epi1' });
        epiDeliveryRepositoryMock.createBatch.mockResolvedValue({ count: 0 });

        await expect(
            createEpiDeliveryService.execute({ employeeId: '1', caNumbers: ['11070'], deliveredById: '2' })
        ).rejects.toThrow('Falha ao registrar uma ou mais entregas no banco de dados.');
    });
});
