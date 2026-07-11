import { jest } from '@jest/globals';

const listCompaniesServiceMock = { execute: jest.fn() };
const createCompanyServiceMock = { execute: jest.fn() };
const findCompanyByIdServiceMock = { execute: jest.fn() };
const updateCompanyServiceMock = { execute: jest.fn() };
const deleteCompanyServiceMock = { execute: jest.fn() };

jest.unstable_mockModule('../services/ListCompaniesService.js', () => ({
    default: listCompaniesServiceMock
}));
jest.unstable_mockModule('../services/CreateCompanyService.js', () => ({
    default: createCompanyServiceMock
}));
jest.unstable_mockModule('../services/FindCompanyByIdService.js', () => ({
    default: findCompanyByIdServiceMock
}));
jest.unstable_mockModule('../services/UpdateCompanyService.js', () => ({
    default: updateCompanyServiceMock
}));
jest.unstable_mockModule('../services/DeleteCompanyService.js', () => ({
    default: deleteCompanyServiceMock
}));

const companyController = (await import('./CompanyController.js')).default;

describe('CompanyController', () => {
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

    it('deve retornar lista de empresas com sucesso', async () => {
        const empresasMock = [{ id: '1', name: 'Empresa 1', cnpj: '1', isActive: true }];
        listCompaniesServiceMock.execute.mockResolvedValue(empresasMock);

        await companyController.findAll(mockRequest, mockResponse, next);

        expect(mockResponse.json).toHaveBeenCalledWith(empresasMock);
    });

    it('deve criar empresa com status 201', async () => {
        mockRequest.body = { name: 'Nova', cnpj: '1' };
        const empresa = { id: '1', name: 'Nova', cnpj: '1', isActive: true };
        createCompanyServiceMock.execute.mockResolvedValue(empresa);

        await companyController.create(mockRequest, mockResponse, next);

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(empresa);
    });

    it('deve buscar empresa por id', async () => {
        mockRequest.params = { id: '1' };
        const empresa = { id: '1', name: 'Empresa', cnpj: '1', isActive: true };
        findCompanyByIdServiceMock.execute.mockResolvedValue(empresa);

        await companyController.findById(mockRequest, mockResponse, next);

        expect(findCompanyByIdServiceMock.execute).toHaveBeenCalledWith('1');
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(empresa);
    });

    it('deve atualizar empresa', async () => {
        mockRequest.params = { id: '1' };
        mockRequest.body = { name: 'Atualizada', cnpj: '2' };
        const empresa = { id: '1', name: 'Atualizada', cnpj: '2', isActive: true };
        updateCompanyServiceMock.execute.mockResolvedValue(empresa);

        await companyController.update(mockRequest, mockResponse, next);

        expect(updateCompanyServiceMock.execute).toHaveBeenCalledWith('1', {
            name: 'Atualizada',
            cnpj: '2',
            isActive: undefined
        });
        expect(mockResponse.json).toHaveBeenCalledWith(empresa);
    });

    it('deve excluir empresa com status 204', async () => {
        mockRequest.params = { id: '1' };
        deleteCompanyServiceMock.execute.mockResolvedValue();

        await companyController.delete(mockRequest, mockResponse, next);

        expect(deleteCompanyServiceMock.execute).toHaveBeenCalledWith('1');
        expect(mockResponse.status).toHaveBeenCalledWith(204);
    });

    it('deve encaminhar erro para o middleware global', async () => {
        const erro = new Error('Database error');
        listCompaniesServiceMock.execute.mockRejectedValue(erro);

        await companyController.findAll(mockRequest, mockResponse, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('deve encaminhar erro ao criar empresa', async () => {
        const erro = new Error('falha create');
        createCompanyServiceMock.execute.mockRejectedValue(erro);

        await companyController.create(mockRequest, mockResponse, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('deve encaminhar erro ao buscar empresa por id', async () => {
        const erro = new Error('falha find');
        findCompanyByIdServiceMock.execute.mockRejectedValue(erro);
        mockRequest.params = { id: '1' };

        await companyController.findById(mockRequest, mockResponse, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('deve encaminhar erro ao atualizar empresa', async () => {
        const erro = new Error('falha update');
        updateCompanyServiceMock.execute.mockRejectedValue(erro);
        mockRequest.params = { id: '1' };

        await companyController.update(mockRequest, mockResponse, next);

        expect(next).toHaveBeenCalledWith(erro);
    });

    it('deve encaminhar erro ao excluir empresa', async () => {
        const erro = new Error('falha delete');
        deleteCompanyServiceMock.execute.mockRejectedValue(erro);
        mockRequest.params = { id: '1' };

        await companyController.delete(mockRequest, mockResponse, next);

        expect(next).toHaveBeenCalledWith(erro);
    });
});
