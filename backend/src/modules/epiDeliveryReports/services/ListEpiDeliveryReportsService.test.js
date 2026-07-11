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

    it('deve ignorar ultimosDias nulo e usar consulta padrao', async () => {
        epiDeliveryReportRepositoryMock.findManyComFiltros.mockResolvedValue({
            itens: [],
            pagina: 1,
            limite: 20,
            totalItens: 0,
            totalPaginas: 1
        });

        await listEpiDeliveryReportsService.execute({ ultimosDias: null });

        expect(epiDeliveryReportRepositoryMock.findManyComFiltros).toHaveBeenCalledWith(
            expect.objectContaining({ ultimosDias: undefined })
        );
    });

    it('deve listar com consulta padrao vazia', async () => {
        epiDeliveryReportRepositoryMock.findManyComFiltros.mockResolvedValue({
            itens: [],
            pagina: 1,
            limite: 20,
            totalItens: 0,
            totalPaginas: 1
        });

        await listEpiDeliveryReportsService.execute();

        expect(epiDeliveryReportRepositoryMock.findManyComFiltros).toHaveBeenCalled();
    });

    it('deve repassar employeeId informado na consulta', async () => {
        epiDeliveryReportRepositoryMock.findManyComFiltros.mockResolvedValue({
            itens: [],
            pagina: 1,
            limite: 20,
            totalItens: 0,
            totalPaginas: 1
        });

        await listEpiDeliveryReportsService.execute({ employeeId: 'emp-99' });

        expect(epiDeliveryReportRepositoryMock.findManyComFiltros).toHaveBeenCalledWith(
            expect.objectContaining({ employeeId: 'emp-99' })
        );
    });

    it('deve ignorar foiAssinado vazio na consulta', async () => {
        epiDeliveryReportRepositoryMock.findManyComFiltros.mockResolvedValue({
            itens: [],
            pagina: 1,
            limite: 20,
            totalItens: 0,
            totalPaginas: 1
        });

        await listEpiDeliveryReportsService.execute({ foiAssinado: '' });

        expect(epiDeliveryReportRepositoryMock.findManyComFiltros).toHaveBeenCalledWith(
            expect.objectContaining({ foiAssinado: undefined })
        );
    });

    it('deve ignorar foiAssinado nulo e employeeId ausente na consulta', async () => {
        epiDeliveryReportRepositoryMock.findManyComFiltros.mockResolvedValue({
            itens: [],
            pagina: 1,
            limite: 20,
            totalItens: 0,
            totalPaginas: 1
        });

        await listEpiDeliveryReportsService.execute({ foiAssinado: null });

        expect(epiDeliveryReportRepositoryMock.findManyComFiltros).toHaveBeenCalledWith(
            expect.objectContaining({ foiAssinado: undefined, employeeId: undefined })
        );
    });

    it('deve interpretar true literal e ultimosDias invalido com padrao', async () => {
        epiDeliveryReportRepositoryMock.findManyComFiltros.mockResolvedValue({
            itens: [],
            pagina: 1,
            limite: 20,
            totalItens: 0,
            totalPaginas: 1
        });

        await listEpiDeliveryReportsService.execute({
            foiAssinado: 'true',
            ultimosDias: 'invalido'
        });

        expect(epiDeliveryReportRepositoryMock.findManyComFiltros).toHaveBeenCalledWith(
            expect.objectContaining({
                foiAssinado: true,
                ultimosDias: 15
            })
        );
    });

    it('deve repassar filtro ultimosDias e booleanos true/1', async () => {
        epiDeliveryReportRepositoryMock.findManyComFiltros.mockResolvedValue({
            itens: [],
            pagina: 2,
            limite: 50,
            totalItens: 0,
            totalPaginas: 1
        });

        await listEpiDeliveryReportsService.execute({
            foiAssinado: '1',
            ultimosDias: '10',
            pagina: '2',
            limite: '50'
        });

        expect(epiDeliveryReportRepositoryMock.findManyComFiltros).toHaveBeenCalledWith(
            expect.objectContaining({
                foiAssinado: true,
                ultimosDias: 10,
                pagina: 2,
                limite: 50
            })
        );
    });

    it('deve interpretar false/0 e ignorar booleano invalido', async () => {
        epiDeliveryReportRepositoryMock.findManyComFiltros.mockResolvedValue({
            itens: [],
            pagina: 1,
            limite: 20,
            totalItens: 0,
            totalPaginas: 1
        });

        await listEpiDeliveryReportsService.execute({
            foiAssinado: 'false'
        });

        expect(epiDeliveryReportRepositoryMock.findManyComFiltros).toHaveBeenCalledWith(
            expect.objectContaining({ foiAssinado: false })
        );

        await listEpiDeliveryReportsService.execute({
            foiAssinado: '0'
        });

        expect(epiDeliveryReportRepositoryMock.findManyComFiltros).toHaveBeenCalledWith(
            expect.objectContaining({ foiAssinado: false })
        );

        await listEpiDeliveryReportsService.execute({
            foiAssinado: 'talvez'
        });

        expect(epiDeliveryReportRepositoryMock.findManyComFiltros).toHaveBeenLastCalledWith(
            expect.objectContaining({ foiAssinado: undefined })
        );
    });

    it('deve usar pagina e limite padrao para valores invalidos e limitar ao maximo', async () => {
        epiDeliveryReportRepositoryMock.findManyComFiltros.mockResolvedValue({
            itens: [],
            pagina: 1,
            limite: 100,
            totalItens: 0,
            totalPaginas: 1
        });

        await listEpiDeliveryReportsService.execute({
            pagina: 'abc',
            limite: '999'
        });

        expect(epiDeliveryReportRepositoryMock.findManyComFiltros).toHaveBeenCalledWith(
            expect.objectContaining({ pagina: 1, limite: 100 })
        );
    });

    it('deve ignorar employeeId vazio apos trim', async () => {
        epiDeliveryReportRepositoryMock.findManyComFiltros.mockResolvedValue({
            itens: [],
            pagina: 1,
            limite: 20,
            totalItens: 0,
            totalPaginas: 1
        });

        await listEpiDeliveryReportsService.execute({ employeeId: '   ' });

        expect(epiDeliveryReportRepositoryMock.findManyComFiltros).toHaveBeenCalledWith(
            expect.objectContaining({ employeeId: undefined })
        );
    });

    it('deve exigir emissaoInicio e emissaoFim juntos', async () => {
        await expect(
            listEpiDeliveryReportsService.execute({ emissaoInicio: '2026-01-01' })
        ).rejects.toThrow('periodoInicio e periodoFim devem estar no formato AAAA-MM-DD.');

        await expect(
            listEpiDeliveryReportsService.execute({ emissaoFim: '2026-01-31' })
        ).rejects.toThrow('periodoInicio e periodoFim devem estar no formato AAAA-MM-DD.');
    });
});
