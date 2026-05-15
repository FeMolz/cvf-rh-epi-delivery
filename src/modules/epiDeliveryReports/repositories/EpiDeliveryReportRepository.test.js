import { jest } from '@jest/globals';

const prismaMock = {
    employee: {
        findFirst: jest.fn()
    },
    epiDeliveryReport: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn()
    }
};

jest.unstable_mockModule('../../../config/database.js', () => ({
    default: prismaMock
}));

const epiDeliveryReportRepository = (await import('./EpiDeliveryReportRepository.js')).default;

describe('EpiDeliveryReportRepository', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('findEmployeeContextForReport deve consultar funcionario ativo', async () => {
        prismaMock.employee.findFirst.mockResolvedValue({ id: 'e1', name: 'Joao' });
        const resultado = await epiDeliveryReportRepository.findEmployeeContextForReport('e1');
        expect(resultado).toEqual({ id: 'e1', name: 'Joao' });
        expect(prismaMock.employee.findFirst).toHaveBeenCalled();
    });

    it('createReport deve persistir relatorio', async () => {
        prismaMock.epiDeliveryReport.create.mockResolvedValue({ id: 'r1' });
        const resultado = await epiDeliveryReportRepository.createReport({ id: 'r1', employeeId: 'e1' });
        expect(resultado).toEqual({ id: 'r1' });
        expect(prismaMock.epiDeliveryReport.create).toHaveBeenCalled();
    });

    it('findAllPendingSignatureOrdered deve filtrar por foiAssinado false', async () => {
        prismaMock.epiDeliveryReport.findMany.mockResolvedValue([]);
        await epiDeliveryReportRepository.findAllPendingSignatureOrdered();
        expect(prismaMock.epiDeliveryReport.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { foiAssinado: false } })
        );
    });

    it('findArchiveByEmployeeId deve listar todos os relatorios do funcionario', async () => {
        prismaMock.epiDeliveryReport.findMany.mockResolvedValue([{ id: 'r1' }]);
        const resultado = await epiDeliveryReportRepository.findArchiveByEmployeeId('e1');
        expect(resultado).toEqual([{ id: 'r1' }]);
        expect(prismaMock.epiDeliveryReport.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: { employeeId: 'e1' } })
        );
    });

    it('updateFlagsById deve atualizar campos', async () => {
        prismaMock.epiDeliveryReport.update.mockResolvedValue({ id: 'r1', foiImpresso: true });
        const resultado = await epiDeliveryReportRepository.updateFlagsById('r1', { foiImpresso: true });
        expect(resultado.foiImpresso).toBe(true);
    });
});
