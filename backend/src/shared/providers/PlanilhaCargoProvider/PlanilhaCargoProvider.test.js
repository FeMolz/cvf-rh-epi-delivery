import { jest } from '@jest/globals';

const worksheetMock = {
    columns: [],
    getRow: jest.fn().mockReturnValue({ font: {} }),
    addRows: jest.fn()
};

const workbookMock = {
    addWorksheet: jest.fn().mockReturnValue(worksheetMock),
    xlsx: {
        writeBuffer: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]))
    }
};

describe('PlanilhaCargoProvider', () => {
    let planilhaCargoProvider;

    beforeEach(async () => {
        jest.resetModules();
        worksheetMock.getRow.mockReturnValue({ font: {} });
        workbookMock.addWorksheet.mockReturnValue(worksheetMock);

        jest.unstable_mockModule('exceljs', () => ({
            default: {
                Workbook: jest.fn().mockImplementation(() => workbookMock)
            }
        }));

        planilhaCargoProvider = (await import('./PlanilhaCargoProvider.js')).default;
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('deve gerar buffer da planilha de lista de cargos', async () => {
        const linhas = [
            {
                nome: 'Analista',
                descricao: 'Cargo técnico',
                epis: 3,
                situacao: 'ATIVO',
                criadoEm: '01/01/2026',
                inativadoEm: ''
            }
        ];

        const buffer = await planilhaCargoProvider.gerarPlanilhaListaCargos(linhas);

        expect(workbookMock.addWorksheet).toHaveBeenCalledWith('Cargos');
        expect(worksheetMock.getRow).toHaveBeenCalledWith(1);
        expect(worksheetMock.addRows).toHaveBeenCalledWith(linhas);
        expect(Buffer.isBuffer(buffer)).toBe(true);
    });
});
