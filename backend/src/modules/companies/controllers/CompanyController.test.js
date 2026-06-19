import { jest } from '@jest/globals';

const listCompaniesServiceMock = {
    execute: jest.fn()
};

jest.unstable_mockModule('../services/ListCompaniesService.js', () => ({
    default: listCompaniesServiceMock
}));

const companyController = (await import('./CompanyController.js')).default;

describe('CompanyController', () => {
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

    it('deve retornar lista de empresas com sucesso', async () => {
        const empresasMock = [
            { id: '1', name: 'Empresa 1', cnpj: '11.111.111/0001-11', isActive: true },
            { id: '2', name: 'Empresa 2', cnpj: '22.222.222/0001-22', isActive: true }
        ];

        listCompaniesServiceMock.execute.mockResolvedValue(empresasMock);

        await companyController.findAll(mockRequest, mockResponse, next);

        expect(listCompaniesServiceMock.execute).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith(empresasMock);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve encaminhar erro para o middleware global', async () => {
        const erro = new Error('Database error');
        listCompaniesServiceMock.execute.mockRejectedValue(erro);

        await companyController.findAll(mockRequest, mockResponse, next);

        expect(next).toHaveBeenCalledWith(erro);
    });
});
