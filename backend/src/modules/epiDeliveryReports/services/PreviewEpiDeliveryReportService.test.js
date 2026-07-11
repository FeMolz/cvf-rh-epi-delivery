import { jest } from '@jest/globals';

const epiDeliveryReportRepositoryMock = {
    findEmployeeContextForReport: jest.fn()
};

const epiDeliveryRepositoryMock = {
    findDeliveriesByEmployeeIdAndDeliveryDateRange: jest.fn()
};

jest.unstable_mockModule('../repositories/EpiDeliveryReportRepository.js', () => ({
    default: epiDeliveryReportRepositoryMock
}));

jest.unstable_mockModule('../../epiDeliveries/repositories/EpiDeliveryRepository.js', () => ({
    default: epiDeliveryRepositoryMock
}));

const previewEpiDeliveryReportService = (await import('./PreviewEpiDeliveryReportService.js')).default;

describe('PreviewEpiDeliveryReportService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar preview das entregas no periodo', async () => {
        epiDeliveryReportRepositoryMock.findEmployeeContextForReport.mockResolvedValue({
            id: 'e1',
            name: 'Ana Silva',
            role: { name: 'Pedreiro' },
            company: { name: 'CVF' },
            setor: { nome: 'Obras' }
        });
        epiDeliveryRepositoryMock.findDeliveriesByEmployeeIdAndDeliveryDateRange.mockResolvedValue([
            {
                deliveryDate: new Date('2026-01-10T00:00:00.000Z'),
                epi: { name: 'Capacete', caNumber: '11070' }
            }
        ]);

        const resultado = await previewEpiDeliveryReportService.execute({
            employeeId: 'e1',
            periodoInicio: '2026-01-01',
            periodoFim: '2026-01-31'
        });

        expect(resultado.employee.name).toBe('Ana Silva');
        expect(resultado.entregas).toHaveLength(1);
        expect(resultado.entregas[0].numeroCa).toBe('11070');
    });

    it('deve rejeitar quando funcionario nao for encontrado', async () => {
        epiDeliveryReportRepositoryMock.findEmployeeContextForReport.mockResolvedValue(null);

        await expect(
            previewEpiDeliveryReportService.execute({
                employeeId: 'inexistente',
                periodoInicio: '2026-01-01',
                periodoFim: '2026-01-31'
            })
        ).rejects.toThrow('Funcionario nao encontrado ou indisponivel para emissao.');
    });

    it('deve usar tracos quando cargo empresa ou setor estiverem ausentes', async () => {
        epiDeliveryReportRepositoryMock.findEmployeeContextForReport.mockResolvedValue({
            id: 'e2',
            name: 'Carlos',
            role: null,
            company: null,
            setor: null
        });
        epiDeliveryRepositoryMock.findDeliveriesByEmployeeIdAndDeliveryDateRange.mockResolvedValue([]);

        const resultado = await previewEpiDeliveryReportService.execute({
            employeeId: 'e2',
            periodoInicio: '2026-01-01',
            periodoFim: '2026-01-31'
        });

        expect(resultado.employee).toMatchObject({
            roleName: '—',
            companyName: '—',
            setorName: '—'
        });
    });

    it('deve exigir campos obrigatorios', async () => {
        await expect(previewEpiDeliveryReportService.execute({ employeeId: 'e1' })).rejects.toThrow(
            'employeeId, periodoInicio e periodoFim sao obrigatorios.'
        );
    });
});
