import { jest } from '@jest/globals';

const listSetoresServiceMock = {
    execute: jest.fn()
};

jest.unstable_mockModule('../services/ListSetoresService.js', () => ({
    default: listSetoresServiceMock
}));

const setorController = (await import('./SetorController.js')).default;

describe('SetorController', () => {
    let mockRequest;
    let mockResponse;
    let next;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('deve retornar a lista de setores com sucesso', async () => {
        const setoresMock = [
            { id: '1', nome: 'ADMINISTRATIVO', isActive: true },
            { id: '2', nome: 'TI', isActive: true }
        ];

        listSetoresServiceMock.execute.mockResolvedValue(setoresMock);

        await setorController.findAll(mockRequest, mockResponse, next);

        expect(listSetoresServiceMock.execute).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith(setoresMock);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve encaminhar erro para o middleware global', async () => {
        const erro = new Error('Database error');
        listSetoresServiceMock.execute.mockRejectedValue(erro);

        await setorController.findAll(mockRequest, mockResponse, next);

        expect(next).toHaveBeenCalledWith(erro);
    });
});
