import { jest } from '@jest/globals';

const linkQuesitoToRoleServiceMock = {
    execute: jest.fn()
};

const unlinkQuesitoFromRoleServiceMock = {
    execute: jest.fn()
};

const listQuesitosVinculadosAoCargoServiceMock = {
    execute: jest.fn()
};

jest.unstable_mockModule('../services/LinkQuesitoToRoleService.js', () => ({
    default: linkQuesitoToRoleServiceMock
}));

jest.unstable_mockModule('../services/UnlinkQuesitoFromRoleService.js', () => ({
    default: unlinkQuesitoFromRoleServiceMock
}));

jest.unstable_mockModule('../services/ListQuesitosVinculadosAoCargoService.js', () => ({
    default: listQuesitosVinculadosAoCargoServiceMock
}));

const quesitoToRoleController = (await import('./QuesitoToRoleController.js')).default;

describe('QuesitoToRoleController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('link deve retornar 201 em sucesso', async () => {
        const mockReq = { body: { roleId: '1', quesitoId: '2' } };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        linkQuesitoToRoleServiceMock.execute.mockResolvedValue({ id: 'v' });
        await quesitoToRoleController.link(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith({ id: 'v' });
    });

    it('unlink deve retornar 200 em sucesso', async () => {
        const mockReq = { params: { roleId: '1', quesitoId: '2' } };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        unlinkQuesitoFromRoleServiceMock.execute.mockResolvedValue({ id: 'v' });
        await quesitoToRoleController.unlink(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('listByRole deve retornar 200 com lista', async () => {
        const mockReq = { params: { roleId: '1' } };
        const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const mockNext = jest.fn();

        listQuesitosVinculadosAoCargoServiceMock.execute.mockResolvedValue([{ id: '1' }]);
        await quesitoToRoleController.listByRole(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('link deve encaminhar erro com statusCode ao next', async () => {
        const erro = Object.assign(new Error('ja vinculado'), { statusCode: 409 });
        const mockNext = jest.fn();

        linkQuesitoToRoleServiceMock.execute.mockRejectedValue(erro);
        await quesitoToRoleController.link({ body: {} }, { status: jest.fn(), json: jest.fn() }, mockNext);

        expect(mockNext).toHaveBeenCalledWith(erro);
    });

    it('link deve normalizar erro sem statusCode', async () => {
        const mockNext = jest.fn();

        linkQuesitoToRoleServiceMock.execute.mockRejectedValue(new Error('dados invalidos'));
        await quesitoToRoleController.link({ body: {} }, { status: jest.fn(), json: jest.fn() }, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'dados invalidos', statusCode: 400 })
        );
    });

    it('unlink deve encaminhar erro ao next', async () => {
        const erro = Object.assign(new Error('vinculo inexistente'), { statusCode: 404 });
        const mockNext = jest.fn();

        unlinkQuesitoFromRoleServiceMock.execute.mockRejectedValue(erro);
        await quesitoToRoleController.unlink(
            { params: { roleId: '1', quesitoId: '2' } },
            { status: jest.fn(), json: jest.fn() },
            mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(erro);
    });

    it('listByRole deve encaminhar erro ao next', async () => {
        const erro = new Error('cargo nao encontrado');
        const mockNext = jest.fn();

        listQuesitosVinculadosAoCargoServiceMock.execute.mockRejectedValue(erro);
        await quesitoToRoleController.listByRole(
            { params: { roleId: '1' } },
            { status: jest.fn().mockReturnThis(), json: jest.fn() },
            mockNext
        );

        expect(mockNext).toHaveBeenCalledWith(erro);
    });
});
