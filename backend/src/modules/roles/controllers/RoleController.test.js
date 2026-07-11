import { jest } from '@jest/globals';
import { TIPO_MIME_PLANILHA_XLSX } from '../constants/roleConstantes.js';

const createRoleServiceMock = { execute: jest.fn() };
const alterarSituacaoCargoServiceMock = { execute: jest.fn() };
const deleteRoleServiceMock = { execute: jest.fn() };
const exportarListaCargosPlanilhaServiceMock = { execute: jest.fn() };
const findRoleByIdServiceMock = { execute: jest.fn() };
const listRolesServiceMock = { execute: jest.fn() };
const updateRoleServiceMock = { execute: jest.fn() };

jest.unstable_mockModule('../services/CreateRoleService.js', () => ({
    default: createRoleServiceMock
}));
jest.unstable_mockModule('../services/AlterarSituacaoCargoService.js', () => ({
    default: alterarSituacaoCargoServiceMock
}));
jest.unstable_mockModule('../services/DeleteRoleService.js', () => ({
    default: deleteRoleServiceMock
}));
jest.unstable_mockModule('../services/ExportarListaCargosPlanilhaService.js', () => ({
    default: exportarListaCargosPlanilhaServiceMock
}));
jest.unstable_mockModule('../services/FindRoleByIdService.js', () => ({
    default: findRoleByIdServiceMock
}));
jest.unstable_mockModule('../services/ListRolesService.js', () => ({
    default: listRolesServiceMock
}));
jest.unstable_mockModule('../services/UpdateRoleService.js', () => ({
    default: updateRoleServiceMock
}));

const roleController = (await import('./RoleController.js')).default;

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

describe('RoleController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a role and return 201 status', async () => {
        const req = {
            body: { name: 'ADMIN', description: 'Admin role' }
        };
        const res = mockResponse();
        const next = jest.fn();

        const createdRole = { id: 1, ...req.body };
        createRoleServiceMock.execute.mockResolvedValue(createdRole);

        await roleController.create(req, res, next);

        expect(createRoleServiceMock.execute).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(createdRole);
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if create service throws', async () => {
        const req = {
            body: { name: 'ADMIN', description: 'Admin role' }
        };
        const res = mockResponse();
        const next = jest.fn();

        const error = new Error('Role already exists.');
        createRoleServiceMock.execute.mockRejectedValue(error);

        await roleController.create(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should export role list spreadsheet', async () => {
        const req = { query: { apenasInativos: 'true' } };
        const res = mockResponse();
        const next = jest.fn();
        const resultado = { nomeArquivo: 'cargos.xlsx', buffer: Buffer.from('xlsx') };

        exportarListaCargosPlanilhaServiceMock.execute.mockResolvedValue(resultado);

        await roleController.exportarLista(req, res, next);

        expect(exportarListaCargosPlanilhaServiceMock.execute).toHaveBeenCalledWith({ apenasInativos: true });
        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', TIPO_MIME_PLANILHA_XLSX);
        expect(res.setHeader).toHaveBeenCalledWith(
            'Content-Disposition',
            'attachment; filename="cargos.xlsx"'
        );
        expect(res.send).toHaveBeenCalledWith(resultado.buffer);
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next when export fails', async () => {
        const req = { query: {} };
        const res = mockResponse();
        const next = jest.fn();
        const erro = new Error('falha exportacao');

        exportarListaCargosPlanilhaServiceMock.execute.mockRejectedValue(erro);

        await roleController.exportarLista(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('should list roles with query flags', async () => {
        const req = {
            query: { incluirInativos: 'true', apenasInativos: 'false' },
            user: { role: 'ADMIN' }
        };
        const res = mockResponse();
        const next = jest.fn();
        const cargos = [{ id: 1, name: 'ADMIN' }];

        listRolesServiceMock.execute.mockResolvedValue(cargos);

        await roleController.findAll(req, res, next);

        expect(listRolesServiceMock.execute).toHaveBeenCalledWith({
            incluirInativos: true,
            apenasInativos: false,
            papelUsuario: 'ADMIN'
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(cargos);
    });

    it('should call next when list roles fails', async () => {
        const req = { query: {}, user: {} };
        const res = mockResponse();
        const next = jest.fn();
        const erro = new Error('falha listagem');

        listRolesServiceMock.execute.mockRejectedValue(erro);

        await roleController.findAll(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('should find role by id', async () => {
        const req = { params: { id: '1' } };
        const res = mockResponse();
        const next = jest.fn();
        const cargo = { id: '1', name: 'ADMIN' };

        findRoleByIdServiceMock.execute.mockResolvedValue(cargo);

        await roleController.findById(req, res, next);

        expect(findRoleByIdServiceMock.execute).toHaveBeenCalledWith('1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(cargo);
    });

    it('should call next when findById fails', async () => {
        const req = { params: { id: '1' } };
        const res = mockResponse();
        const next = jest.fn();
        const erro = new Error('nao encontrado');

        findRoleByIdServiceMock.execute.mockRejectedValue(erro);

        await roleController.findById(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('should update role', async () => {
        const req = { params: { id: '1' }, body: { name: 'Novo', description: 'Desc' } };
        const res = mockResponse();
        const next = jest.fn();
        const cargo = { id: '1', name: 'Novo' };

        updateRoleServiceMock.execute.mockResolvedValue(cargo);

        await roleController.update(req, res, next);

        expect(updateRoleServiceMock.execute).toHaveBeenCalledWith('1', { name: 'Novo', description: 'Desc' });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(cargo);
    });

    it('should call next when update fails', async () => {
        const req = { params: { id: '1' }, body: {} };
        const res = mockResponse();
        const next = jest.fn();
        const erro = new Error('falha update');

        updateRoleServiceMock.execute.mockRejectedValue(erro);

        await roleController.update(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('should delete role and return 204', async () => {
        const req = { params: { id: '1' } };
        const res = mockResponse();
        const next = jest.fn();

        deleteRoleServiceMock.execute.mockResolvedValue(undefined);

        await roleController.delete(req, res, next);

        expect(deleteRoleServiceMock.execute).toHaveBeenCalledWith('1');
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });

    it('should call next when delete fails', async () => {
        const req = { params: { id: '1' } };
        const res = mockResponse();
        const next = jest.fn();
        const erro = new Error('falha delete');

        deleteRoleServiceMock.execute.mockRejectedValue(erro);

        await roleController.delete(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('should alter role situation', async () => {
        const req = { params: { id: '1' }, body: { ativo: false } };
        const res = mockResponse();
        const next = jest.fn();
        const cargo = { id: '1', deletedAt: new Date() };

        alterarSituacaoCargoServiceMock.execute.mockResolvedValue(cargo);

        await roleController.alterarSituacao(req, res, next);

        expect(alterarSituacaoCargoServiceMock.execute).toHaveBeenCalledWith('1', { ativo: false });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(cargo);
    });

    it('should call next when alterarSituacao fails', async () => {
        const req = { params: { id: '1' }, body: { ativo: true } };
        const res = mockResponse();
        const next = jest.fn();
        const erro = new Error('falha situacao');

        alterarSituacaoCargoServiceMock.execute.mockRejectedValue(erro);

        await roleController.alterarSituacao(req, res, next);

        expect(next).toHaveBeenCalledWith(erro);
    });
});
