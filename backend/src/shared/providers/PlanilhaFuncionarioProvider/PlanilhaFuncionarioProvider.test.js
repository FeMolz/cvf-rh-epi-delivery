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

jest.unstable_mockModule('exceljs', () => ({
    default: {
        Workbook: jest.fn().mockImplementation(() => workbookMock)
    }
}));

const planilhaFuncionarioProvider = (
    await import('./PlanilhaFuncionarioProvider.js')
).default;

describe('PlanilhaFuncionarioProvider', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve gerar buffer da planilha de lista de funcionários', async () => {
        const linhas = [
            {
                nome: 'Ana',
                cargo: 'Analista',
                setor: 'TI',
                status: 'ATIVO',
                dataDemissao: ''
            }
        ];

        const buffer = await planilhaFuncionarioProvider.gerarPlanilhaListaFuncionarios(linhas);

        expect(workbookMock.addWorksheet).toHaveBeenCalledWith('Funcionários');
        expect(worksheetMock.addRows).toHaveBeenCalledWith(linhas);
        expect(Buffer.isBuffer(buffer)).toBe(true);
    });

    it('deve gerar buffer da ficha do funcionário', async () => {
        const pares = [{ campo: 'Nome', valor: 'Ana' }];

        const buffer = await planilhaFuncionarioProvider.gerarPlanilhaFichaFuncionario(
            'Funcionário',
            pares
        );

        expect(workbookMock.addWorksheet).toHaveBeenCalledWith('Funcionário');
        expect(worksheetMock.addRows).toHaveBeenCalledWith(pares);
        expect(Buffer.isBuffer(buffer)).toBe(true);
    });

    it('deve sanitizar nome de arquivo removendo caracteres inválidos', () => {
        expect(planilhaFuncionarioProvider.sanitizarNomeArquivo('João Silva!')).toBe(
            'joao-silva'
        );
    });

    it('deve montar título único de aba quando houver colisão', () => {
        const titulosUsados = new Set(['Ana Silva']);

        const titulo = planilhaFuncionarioProvider.montarTituloAbaPlanilha('Ana Silva', titulosUsados);

        expect(titulo).toBe('Ana Silva-2');
        expect(titulosUsados.has(titulo)).toBe(true);
    });

    it('deve sanitizar caracteres inválidos no título da aba', () => {
        const titulosUsados = new Set();

        const titulo = planilhaFuncionarioProvider.montarTituloAbaPlanilha('Ana:Silva', titulosUsados);

        expect(titulo).toBe('Ana-Silva');
    });

    it('deve usar título padrão quando base estiver vazia', () => {
        const titulosUsados = new Set();

        const titulo = planilhaFuncionarioProvider.montarTituloAbaPlanilha('   ', titulosUsados);

        expect(titulo).toBe('Funcionario');
    });

    it('deve usar título padrão quando base for null', () => {
        const titulosUsados = new Set();

        const titulo = planilhaFuncionarioProvider.montarTituloAbaPlanilha(null, titulosUsados);

        expect(titulo).toBe('Funcionario');
    });

    it('deve gerar planilha com múltiplas fichas de funcionários', async () => {
        const fichas = [
            { tituloBase: 'Ana', paresCampoValor: [{ campo: 'Nome', valor: 'Ana' }] },
            { tituloBase: 'Bruno', paresCampoValor: [{ campo: 'Nome', valor: 'Bruno' }] }
        ];

        const buffer = await planilhaFuncionarioProvider.gerarPlanilhaFichasFuncionarios(fichas);

        expect(workbookMock.addWorksheet).toHaveBeenCalledTimes(2);
        expect(Buffer.isBuffer(buffer)).toBe(true);
    });
});
