import { jest } from '@jest/globals';

const listSetoresServiceMock = { execute: jest.fn() };
const createSetorServiceMock = { execute: jest.fn() };
const findSetorByIdServiceMock = { execute: jest.fn() };
const updateSetorServiceMock = { execute: jest.fn() };
const deleteSetorServiceMock = { execute: jest.fn() };

jest.unstable_mockModule('../services/ListSetoresService.js', () => ({
    default: listSetoresServiceMock
}));
jest.unstable_mockModule('../services/CreateSetorService.js', () => ({
    default: createSetorServiceMock
}));
jest.unstable_mockModule('../services/FindSetorByIdService.js', () => ({
    default: findSetorByIdServiceMock
}));
jest.unstable_mockModule('../services/UpdateSetorService.js', () => ({
    default: updateSetorServiceMock
}));
jest.unstable_mockModule('../services/DeleteSetorService.js', () => ({
    default: deleteSetorServiceMock
}));

const setorController = (await import('./SetorController.js')).default;

describe('SetorController', () => {
    let mockRequest;
    let mockResponse;
    let next;

    beforeEach(() => {
        mockRequest = { params: {}, body: {} };
        mockResponse = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('deve retornar a lista de setores com sucesso', async () => {
        const setoresMock = [{ id: '1', nome: 'ADMINISTRATIVO', isActive: true }];
        listSetoresServiceMock.execute.mockResolvedValue(setoresMock);

        await setorController.findAll(mockRequest, mockResponse, next);

        expect(mockResponse.json).toHaveBeenCalledWith(setoresMock);
    });

    it('deve criar setor com status 201', async () => {
        mockRequest.body = { nome: 'TI' };
        const setor = { id: '1', nome: 'TI', isActive: true };
        createSetorServiceMock.execute.mockResolvedValue(setor);

        await setorController.create(mockRequest, mockResponse, next);

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(setor);
    });

    it('deve buscar setor por id', async () => {
        mockRequest.params = { id: '1' };
        const setor = { id: '1', nome: 'TI', isActive: true };
        findSetorByIdServiceMock.execute.mockResolvedValue(setor);

        await setorController.findById(mockRequest, mockResponse, next);

        expect(findSetorByIdServiceMock.execute).toHaveBeenCalledWith('1');
        expect(mockResponse.json).toHaveBeenCalledWith(setor);
    });

    it('deve atualizar setor', async () => {
        mockRequest.params = { id: '1' };
        mockRequest.body = { nome: 'Tecnologia' };
        const setor = { id: '1', nome: 'Tecnologia', isActive: true };
        updateSetorServiceMock.execute.mockResolvedValue(setor);

        await setorController.update(mockRequest, mockResponse, next);

        expect(updateSetorServiceMock.execute).toHaveBeenCalledWith('1', {
            nome: 'Tecnologia',
            isActive: undefined
        });
        expect(mockResponse.json).toHaveBeenCalledWith(setor);
    });

    it('deve excluir setor com status 204', async () => {
        mockRequest.params = { id: '1' };
        deleteSetorServiceMock.execute.mockResolvedValue();

        await setorController.delete(mockRequest, mockResponse, next);

        expect(deleteSetorServiceMock.execute).toHaveBeenCalledWith('1');
        expect(mockResponse.status).toHaveBeenCalledWith(204);
    });

    it('deve encaminhar erro para o middleware global', async () => {
        const erro = new Error('Database error');
        listSetoresServiceMock.execute.mockRejectedValue(erro);

        await setorController.findAll(mockRequest, mockResponse, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('deve encaminhar erro ao criar setor', async () => {
        const erro = new Error('falha create');
        createSetorServiceMock.execute.mockRejectedValue(erro);

        await setorController.create(mockRequest, mockResponse, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('deve encaminhar erro ao buscar setor por id', async () => {
        const erro = new Error('falha find');
        findSetorByIdServiceMock.execute.mockRejectedValue(erro);
        mockRequest.params = { id: '1' };

        await setorController.findById(mockRequest, mockResponse, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('deve encaminhar erro ao atualizar setor', async () => {
        const erro = new Error('falha update');
        updateSetorServiceMock.execute.mockRejectedValue(erro);
        mockRequest.params = { id: '1' };

        await setorController.update(mockRequest, mockResponse, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('deve encaminhar erro ao excluir setor', async () => {
        const erro = new Error('falha delete');
        deleteSetorServiceMock.execute.mockRejectedValue(erro);
        mockRequest.params = { id: '1' };

        await setorController.delete(mockRequest, mockResponse, next);

        expect(next).toHaveBeenCalledWith(erro);
    });
});
