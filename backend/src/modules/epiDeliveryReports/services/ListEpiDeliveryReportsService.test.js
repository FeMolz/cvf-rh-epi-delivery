import { jest } from '@jest/globals';

const epiDeliveryReportRepositoryMock = {
    findManyComFiltros: jest.fn()
};

jest.unstable_mockModule('../repositories/EpiDeliveryReportRepository.js', () => ({
    default: epiDeliveryReportRepositoryMock
}));

const listEpiDeliveryReportsService = (await import('./ListEpiDeliveryReportsService.js')).default;

describe('ListEpiDeliveryReportsService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve listar relatorios com paginacao padrao', async () => {
        epiDeliveryReportRepositoryMock.findManyComFiltros.mockResolvedValue({
            itens: [{ id: 'r1' }],
            pagina: 1,
            limite: 20,
            totalItens: 1,
            totalPaginas: 1
        });

        const resultado = await listEpiDeliveryReportsService.execute({});

        expect(resultado.itens).toHaveLength(1);
        expect(epiDeliveryReportRepositoryMock.findManyComFiltros).toHaveBeenCalledWith(
            expect.objectContaining({ pagina: 1, limite: 20 })
        );
    });

    it('deve repassar filtros de funcionario e assinatura', async () => {
        epiDeliveryReportRepositoryMock.findManyComFiltros.mockResolvedValue({
            itens: [],
            pagina: 1,
            limite: 20,
            totalItens: 0,
            totalPaginas: 1
        });

        await listEpiDeliveryReportsService.execute({
            employeeId: 'e1',
            foiAssinado: 'false'
        });

        expect(epiDeliveryReportRepositoryMock.findManyComFiltros).toHaveBeenCalledWith(
            expect.objectContaining({
                employeeId: 'e1',
                foiAssinado: false
            })
        );
    });

    it('deve converter intervalo de emissao em datas utc', async () => {
        epiDeliveryReportRepositoryMock.findManyComFiltros.mockResolvedValue({
            itens: [],
            pagina: 1,
            limite: 20,
            totalItens: 0,
            totalPaginas: 1
        });

        await listEpiDeliveryReportsService.execute({
            emissaoInicio: '2026-01-01',
            emissaoFim: '2026-01-31'
        });

        expect(epiDeliveryReportRepositoryMock.findManyComFiltros).toHaveBeenCalledWith(
            expect.objectContaining({
                emissaoInicio: new Date('2026-01-01T00:00:00.000Z'),
                emissaoFim: new Date('2026-01-31T23:59:59.999Z')
            })
        );
    });

    it('deve exigir emissaoInicio e emissaoFim juntos', async () => {
        await expect(
            listEpiDeliveryReportsService.execute({ emissaoInicio: '2026-01-01' })
        ).rejects.toThrow('periodoInicio e periodoFim devem estar no formato AAAA-MM-DD.');
    });
});
