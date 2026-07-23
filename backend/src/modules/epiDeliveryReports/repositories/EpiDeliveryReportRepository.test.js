import { jest } from '@jest/globals';

const prismaMock = {
    employee: {
        findUnique: jest.fn(),
        findMany: jest.fn()
    },
    epiDeliveryReport: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        groupBy: jest.fn()
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

    it('findEmployeeContextForReport deve retornar contexto sem deletedAt', async () => {
        prismaMock.employee.findUnique.mockResolvedValue({
            id: 'e1',
            name: 'Joao',
            deletedAt: null,
            cpf: '1',
            role: { name: 'Cargo' },
            company: { name: 'Empresa' },
            setor: { nome: 'Setor' }
        });
        const resultado = await epiDeliveryReportRepository.findEmployeeContextForReport('e1');
        expect(resultado).toEqual({
            id: 'e1',
            name: 'Joao',
            cpf: '1',
            role: { name: 'Cargo' },
            company: { name: 'Empresa' },
            setor: { nome: 'Setor' }
        });
        expect(prismaMock.employee.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 'e1' } })
        );
    });

    it('findEmployeeContextForReport deve retornar null para funcionario excluido', async () => {
        prismaMock.employee.findUnique.mockResolvedValue({
            id: 'e1',
            deletedAt: new Date()
        });
        const resultado = await epiDeliveryReportRepository.findEmployeeContextForReport('e1');
        expect(resultado).toBeNull();
    });

    it('findEmployeeContextForReport deve retornar null quando funcionario nao existe', async () => {
        prismaMock.employee.findUnique.mockResolvedValue(null);
        const resultado = await epiDeliveryReportRepository.findEmployeeContextForReport('e1');
        expect(resultado).toBeNull();
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

    it('findManyComFiltros deve aplicar filtros e paginacao', async () => {
        prismaMock.epiDeliveryReport.findMany.mockResolvedValue([{ id: 'r1' }]);
        prismaMock.epiDeliveryReport.count.mockResolvedValue(1);

        const resultado = await epiDeliveryReportRepository.findManyComFiltros({
            employeeId: 'e1',
            foiAssinado: false,
            emissaoInicio: new Date('2026-01-01T00:00:00.000Z'),
            emissaoFim: new Date('2026-01-31T23:59:59.999Z'),
            pagina: 2,
            limite: 10
        });

        expect(resultado).toEqual({
            itens: [{ id: 'r1' }],
            pagina: 2,
            limite: 10,
            totalItens: 1,
            totalPaginas: 1
        });
        expect(prismaMock.epiDeliveryReport.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    employeeId: 'e1',
                    foiAssinado: false,
                    createdAt: {
                        gte: new Date('2026-01-01T00:00:00.000Z'),
                        lte: new Date('2026-01-31T23:59:59.999Z')
                    }
                },
                skip: 10,
                take: 10
            })
        );
    });

    it('updateFlagsById deve atualizar campos', async () => {
        prismaMock.epiDeliveryReport.update.mockResolvedValue({ id: 'r1', foiImpresso: true });
        const resultado = await epiDeliveryReportRepository.updateFlagsById('r1', { foiImpresso: true });
        expect(resultado.foiImpresso).toBe(true);
    });

    it('findManyComFiltros deve aplicar filtro ultimosDias', async () => {
        prismaMock.epiDeliveryReport.findMany.mockResolvedValue([]);
        prismaMock.epiDeliveryReport.count.mockResolvedValue(0);

        const resultado = await epiDeliveryReportRepository.findManyComFiltros({ ultimosDias: 15 });

        expect(resultado.pagina).toBe(1);
        expect(resultado.limite).toBe(20);
        expect(prismaMock.epiDeliveryReport.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { createdAt: { gte: expect.any(Date) } }
            })
        );
    });

    it('findManyComFiltros deve usar paginacao padrao', async () => {
        prismaMock.epiDeliveryReport.findMany.mockResolvedValue([]);
        prismaMock.epiDeliveryReport.count.mockResolvedValue(25);

        const resultado = await epiDeliveryReportRepository.findManyComFiltros();

        expect(resultado).toEqual({
            itens: [],
            pagina: 1,
            limite: 20,
            totalItens: 25,
            totalPaginas: 2
        });
    });

    it('findFuncionariosElegiveisEmissaoRelatorio deve filtrar pendentes', async () => {
        prismaMock.employee.findMany.mockResolvedValue([
            {
                id: 'e1',
                name: 'Joao',
                roleId: 'r1',
                role: { name: 'Operador' },
                epiDeliveries: [{ deliveryDate: new Date('2026-01-15') }],
                epiDeliveryReports: []
            },
            {
                id: 'e2',
                name: 'Maria',
                roleId: 'r2',
                role: null,
                epiDeliveries: [{ deliveryDate: new Date('2026-01-15') }],
                epiDeliveryReports: [
                    {
                        periodStartDate: new Date('2026-01-01'),
                        periodEndDate: new Date('2026-01-31')
                    }
                ]
            }
        ]);

        const resultado = await epiDeliveryReportRepository.findFuncionariosElegiveisEmissaoRelatorio();

        expect(resultado).toEqual([
            { id: 'e1', name: 'Joao', roleId: 'r1', roleName: 'Operador' }
        ]);
    });

    it('findFuncionariosElegiveisEmissaoRelatorio deve usar fallback de roleName', async () => {
        prismaMock.employee.findMany.mockResolvedValue([
            {
                id: 'e3',
                name: 'Pedro',
                roleId: 'r3',
                role: null,
                epiDeliveries: [{ deliveryDate: new Date('2026-02-15') }],
                epiDeliveryReports: []
            }
        ]);

        const resultado = await epiDeliveryReportRepository.findFuncionariosElegiveisEmissaoRelatorio();

        expect(resultado).toEqual([
            { id: 'e3', name: 'Pedro', roleId: 'r3', roleName: '—' }
        ]);
    });

    it('findFuncionariosComHistoricoEmissoes deve retornar vazio sem agregados', async () => {
        prismaMock.epiDeliveryReport.groupBy.mockResolvedValue([]);

        const resultado = await epiDeliveryReportRepository.findFuncionariosComHistoricoEmissoes();

        expect(resultado).toEqual([]);
        expect(prismaMock.employee.findMany).not.toHaveBeenCalled();
    });

    it('findFuncionariosComHistoricoEmissoes deve mapear contagem por funcionario', async () => {
        prismaMock.epiDeliveryReport.groupBy.mockResolvedValue([
            { employeeId: 'e1', _count: { id: 3 } }
        ]);
        prismaMock.employee.findMany.mockResolvedValue([
            { id: 'e1', name: 'Joao', role: { name: 'Operador' } }
        ]);

        const resultado = await epiDeliveryReportRepository.findFuncionariosComHistoricoEmissoes();

        expect(resultado).toEqual([
            { id: 'e1', name: 'Joao', roleName: 'Operador', totalEmissoes: 3 }
        ]);
    });

    it('findFuncionariosComHistoricoEmissoes deve usar fallback para role e contagem', async () => {
        prismaMock.epiDeliveryReport.groupBy.mockResolvedValue([
            { employeeId: 'e1', _count: { id: 0 } }
        ]);
        prismaMock.employee.findMany.mockResolvedValue([
            { id: 'e1', name: 'Joao', role: null }
        ]);

        const resultado = await epiDeliveryReportRepository.findFuncionariosComHistoricoEmissoes();

        expect(resultado).toEqual([
            { id: 'e1', name: 'Joao', roleName: '—', totalEmissoes: 0 }
        ]);
    });

    it('findById deve buscar relatorio por id', async () => {
        prismaMock.epiDeliveryReport.findUnique.mockResolvedValue({ id: 'r1' });

        const resultado = await epiDeliveryReportRepository.findById('r1');

        expect(resultado).toEqual({ id: 'r1' });
        expect(prismaMock.epiDeliveryReport.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 'r1' } })
        );
    });

    it('findByIdComPathPdfParaDownload deve buscar path do pdf', async () => {
        prismaMock.epiDeliveryReport.findUnique.mockResolvedValue({
            id: 'r1',
            pdfStoragePath: 'e1/r1.pdf',
            pdfTamanhoBytes: 100
        });

        const resultado = await epiDeliveryReportRepository.findByIdComPathPdfParaDownload('r1');

        expect(resultado.pdfStoragePath).toBe('e1/r1.pdf');
        expect(prismaMock.epiDeliveryReport.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 'r1' } })
        );
    });
});
