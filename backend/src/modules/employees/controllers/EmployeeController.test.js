import { jest } from '@jest/globals';
import { TIPO_MIME_PLANILHA_XLSX } from '../constants/funcionarioExportacaoConstantes.js';

const createEmployeeServiceMock = {
    execute: jest.fn()
};

const updateEmployeeServiceMock = {
    execute: jest.fn()
};

const listEmployeesServiceMock = {
    execute: jest.fn()
};

const findEmployeeByIdServiceMock = {
    execute: jest.fn()
};

const deleteEmployeeServiceMock = {
    execute: jest.fn()
};

const exportarListaFuncionariosPlanilhaServiceMock = {
    execute: jest.fn()
};

const exportarFuncionarioCompletoPlanilhaServiceMock = {
    execute: jest.fn()
};

jest.unstable_mockModule('../services/CreateEmployeeService.js', () => ({
    default: createEmployeeServiceMock
}));

jest.unstable_mockModule('../services/UpdateEmployeeService.js', () => ({
    default: updateEmployeeServiceMock
}));

jest.unstable_mockModule('../services/ListEmployeesService.js', () => ({
    default: listEmployeesServiceMock
}));

jest.unstable_mockModule('../services/FindEmployeeByIdService.js', () => ({
    default: findEmployeeByIdServiceMock
}));

jest.unstable_mockModule('../services/DeleteEmployeeService.js', () => ({
    default: deleteEmployeeServiceMock
}));

jest.unstable_mockModule('../services/ExportarListaFuncionariosPlanilhaService.js', () => ({
    default: exportarListaFuncionariosPlanilhaServiceMock
}));

jest.unstable_mockModule('../services/ExportarFuncionarioCompletoPlanilhaService.js', () => ({
    default: exportarFuncionarioCompletoPlanilhaServiceMock
}));

const employeeController = (await import('./EmployeeController.js')).default;

describe('EmployeeController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar funcionário e retornar 201', async () => {
        const request = {
            body: {
                name: 'John',
                cpf: '123',
                email: 'john@empresa.com',
                telefone: '11988887777',
                companyId: 1
            }
        };
        const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        const funcionarioMock = { id: 1, name: 'John', cpf: '123' };

        createEmployeeServiceMock.execute.mockResolvedValue(funcionarioMock);
        await employeeController.create(request, response, next);

        expect(response.status).toHaveBeenCalledWith(201);
        expect(response.json).toHaveBeenCalledWith(funcionarioMock);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve encaminhar erro de validação na criação', async () => {
        const request = { body: {} };
        const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        const erro = Object.assign(new Error('Campos obrigatórios ausentes'), { statusCode: 400 });

        createEmployeeServiceMock.execute.mockRejectedValue(erro);
        await employeeController.create(request, response, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('deve encaminhar erro na criação quando handler é passado desvinculado ao Express', async () => {
        const request = { body: {} };
        const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        const erro = Object.assign(new Error('Campos obrigatórios ausentes'), { statusCode: 400 });
        const handlerDesvinculado = employeeController.create;

        createEmployeeServiceMock.execute.mockRejectedValue(erro);
        await handlerDesvinculado(request, response, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('deve retornar todos os funcionários', async () => {
        const request = {};
        const response = { json: jest.fn() };
        const next = jest.fn();
        const lista = [{ id: 1, name: 'John' }];

        listEmployeesServiceMock.execute.mockResolvedValue(lista);
        await employeeController.findAll(request, response, next);

        expect(response.json).toHaveBeenCalledWith(lista);
    });

    it('deve retornar funcionário por id', async () => {
        const request = { params: { id: 1 } };
        const response = { json: jest.fn() };
        const next = jest.fn();
        const funcionario = { id: 1, name: 'John' };

        findEmployeeByIdServiceMock.execute.mockResolvedValue(funcionario);
        await employeeController.findById(request, response, next);

        expect(response.json).toHaveBeenCalledWith(funcionario);
    });

    it('deve encaminhar erro 404 quando funcionário não existe', async () => {
        const request = { params: { id: 99 } };
        const response = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        const next = jest.fn();
        const erro = new Error('Funcionário não encontrado');
        erro.statusCode = 404;

        findEmployeeByIdServiceMock.execute.mockRejectedValue(erro);
        await employeeController.findById(request, response, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('deve atualizar funcionário', async () => {
        const request = { params: { id: 1 }, body: { name: 'Jane' } };
        const response = { json: jest.fn() };
        const next = jest.fn();
        const atualizado = { id: 1, name: 'Jane' };

        updateEmployeeServiceMock.execute.mockResolvedValue(atualizado);
        await employeeController.update(request, response, next);

        expect(updateEmployeeServiceMock.execute).toHaveBeenCalledWith(1, { name: 'Jane' });
        expect(response.json).toHaveBeenCalledWith(atualizado);
    });

    it('deve encaminhar erro de validação na atualização', async () => {
        const request = { params: { id: 1 }, body: { cpf: 'invalido' } };
        const response = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        const next = jest.fn();
        const erro = Object.assign(
            new Error('CPF inválido. Os dígitos verificadores não conferem.'),
            { statusCode: 400 }
        );

        updateEmployeeServiceMock.execute.mockRejectedValue(erro);
        await employeeController.update(request, response, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('deve excluir funcionário', async () => {
        const request = { params: { id: 1 } };
        const response = { json: jest.fn() };
        const next = jest.fn();
        const excluido = { id: 1 };

        deleteEmployeeServiceMock.execute.mockResolvedValue(excluido);
        await employeeController.delete(request, response, next);

        expect(response.json).toHaveBeenCalledWith(excluido);
    });

    it('deve encaminhar erro 404 na exclusão quando não encontrado', async () => {
        const request = { params: { id: 99 } };
        const response = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        const next = jest.fn();
        const erro = new Error('Funcionário não encontrado');
        erro.statusCode = 404;

        deleteEmployeeServiceMock.execute.mockRejectedValue(erro);
        await employeeController.delete(request, response, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('deve exportar lista de funcionarios em planilha', async () => {
        const request = { query: { filtro: 'ATIVO', companyId: 'c1', ids: '1,2' } };
        const response = {
            setHeader: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        const next = jest.fn();
        const resultado = { nomeArquivo: 'funcionarios.xlsx', buffer: Buffer.from('xlsx') };

        exportarListaFuncionariosPlanilhaServiceMock.execute.mockResolvedValue(resultado);
        await employeeController.exportarLista(request, response, next);

        expect(exportarListaFuncionariosPlanilhaServiceMock.execute).toHaveBeenCalledWith({
            filtro: 'ATIVO',
            companyId: 'c1',
            ids: '1,2'
        });
        expect(response.setHeader).toHaveBeenCalledWith('Content-Type', TIPO_MIME_PLANILHA_XLSX);
        expect(response.send).toHaveBeenCalledWith(resultado.buffer);
    });

    it('deve exportar lista quando query estiver ausente', async () => {
        const response = {
            setHeader: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        exportarListaFuncionariosPlanilhaServiceMock.execute.mockResolvedValue({
            nomeArquivo: 'lista.xlsx',
            buffer: Buffer.from('xlsx')
        });

        await employeeController.exportarLista({}, response, jest.fn());

        expect(exportarListaFuncionariosPlanilhaServiceMock.execute).toHaveBeenCalledWith({
            filtro: undefined,
            companyId: undefined,
            ids: undefined
        });
    });

    it('deve encaminhar erro na exportacao de lista', async () => {
        const request = { query: {} };
        const response = { setHeader: jest.fn(), send: jest.fn() };
        const next = jest.fn();
        const erro = new Error('falha exportacao');

        exportarListaFuncionariosPlanilhaServiceMock.execute.mockRejectedValue(erro);
        await employeeController.exportarLista(request, response, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('deve exportar ficha completa do funcionario', async () => {
        const request = { params: { id: '1' } };
        const response = {
            setHeader: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        const next = jest.fn();
        const resultado = { nomeArquivo: 'ficha.xlsx', buffer: Buffer.from('xlsx') };

        exportarFuncionarioCompletoPlanilhaServiceMock.execute.mockResolvedValue(resultado);
        await employeeController.exportarFuncionarioCompleto(request, response, next);

        expect(exportarFuncionarioCompletoPlanilhaServiceMock.execute).toHaveBeenCalledWith('1');
        expect(response.send).toHaveBeenCalledWith(resultado.buffer);
    });

    it('deve encaminhar erro na exportacao de ficha', async () => {
        const request = { params: { id: '99' } };
        const response = { setHeader: jest.fn(), send: jest.fn() };
        const next = jest.fn();
        const erro = new Error('nao encontrado');

        exportarFuncionarioCompletoPlanilhaServiceMock.execute.mockRejectedValue(erro);
        await employeeController.exportarFuncionarioCompleto(request, response, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('deve repassar filtro na listagem', async () => {
        const request = { query: { filtro: 'ATIVO' } };
        const response = { json: jest.fn() };
        const next = jest.fn();

        listEmployeesServiceMock.execute.mockResolvedValue([]);
        await employeeController.findAll(request, response, next);

        expect(listEmployeesServiceMock.execute).toHaveBeenCalledWith('ATIVO');
    });

    it('deve encaminhar erro na listagem', async () => {
        const request = { query: {} };
        const response = { json: jest.fn() };
        const next = jest.fn();
        const erro = new Error('falha listagem');

        listEmployeesServiceMock.execute.mockRejectedValue(erro);
        await employeeController.findAll(request, response, next);

        expect(next).toHaveBeenCalledWith(erro);
    });
});
