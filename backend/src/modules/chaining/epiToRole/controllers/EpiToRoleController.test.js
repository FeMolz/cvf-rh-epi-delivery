import { jest } from '@jest/globals';

const linkEpiToRoleServiceMock = {
    execute: jest.fn()
};

const unlinkEpiFromRoleServiceMock = {
    execute: jest.fn()
};

const listEpisByRoleServiceMock = {
    execute: jest.fn()
};

jest.unstable_mockModule('../services/LinkEpiToRoleService.js', () => ({
    default: linkEpiToRoleServiceMock
}));

jest.unstable_mockModule('../services/UnlinkEpiFromRoleService.js', () => ({
    default: unlinkEpiFromRoleServiceMock
}));

jest.unstable_mockModule('../services/ListEpisByRoleService.js', () => ({
    default: listEpisByRoleServiceMock
}));

const epiToRoleController = (await import('./EpiToRoleController.js')).default;

describe('EpiToRoleController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('link deve retornar 201 em caso de sucesso', async () => {
        const mockRequest = { body: { roleId: '1', caNumber: '11070', periodicityDays: 180 } };
        const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        linkEpiToRoleServiceMock.execute.mockResolvedValue({ id: 1 });
        await epiToRoleController.link(mockRequest, mockResponse, next);

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({ id: 1 });
        expect(next).not.toHaveBeenCalled();
    });

    it('unlink deve retornar 200 em caso de sucesso', async () => {
        const mockRequest = { params: { roleId: '1', epiId: '2' } };
        const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        unlinkEpiFromRoleServiceMock.execute.mockResolvedValue({ message: 'Success' });
        await epiToRoleController.unlink(mockRequest, mockResponse, next);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Success' });
        expect(next).not.toHaveBeenCalled();
    });

    it('listByRole deve retornar 200 e lista', async () => {
        const mockRequest = { params: { roleId: '1' } };
        const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        listEpisByRoleServiceMock.execute.mockResolvedValue([{ id: 1 }]);
        await epiToRoleController.listByRole(mockRequest, mockResponse, next);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
        expect(next).not.toHaveBeenCalled();
    });

    it('link deve encaminhar erro ao next', async () => {
        const mockRequest = { body: { roleId: '1', caNumber: '11070' } };
        const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        const erro = new Error('vinculo invalido');

        linkEpiToRoleServiceMock.execute.mockRejectedValue(erro);
        await epiToRoleController.link(mockRequest, mockResponse, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('unlink deve encaminhar erro ao next', async () => {
        const mockRequest = { params: { roleId: '1', epiId: '2' } };
        const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        const erro = new Error('vinculo inexistente');

        unlinkEpiFromRoleServiceMock.execute.mockRejectedValue(erro);
        await epiToRoleController.unlink(mockRequest, mockResponse, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('listByRole deve encaminhar erro ao next', async () => {
        const mockRequest = { params: { roleId: '1' } };
        const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        const erro = new Error('cargo nao encontrado');

        listEpisByRoleServiceMock.execute.mockRejectedValue(erro);
        await epiToRoleController.listByRole(mockRequest, mockResponse, next);

        expect(next).toHaveBeenCalledWith(erro);
    });
});
