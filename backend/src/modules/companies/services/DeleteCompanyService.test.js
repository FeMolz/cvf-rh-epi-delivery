import { jest } from '@jest/globals';

const companyRepositoryMock = {
    findById: jest.fn(),
    countEmployeesByCompanyId: jest.fn(),
    deactivate: jest.fn()
};

jest.unstable_mockModule('../repositories/CompanyRepository.js', () => ({
    default: companyRepositoryMock
}));

const deleteCompanyService = (await import('./DeleteCompanyService.js')).default;

describe('DeleteCompanyService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve desativar empresa sem funcionários vinculados', async () => {
        companyRepositoryMock.findById.mockResolvedValue({ id: '1', isActive: true });
        companyRepositoryMock.countEmployeesByCompanyId.mockResolvedValue(0);
        companyRepositoryMock.deactivate.mockResolvedValue({ id: '1', isActive: false });

        await deleteCompanyService.execute('1');

        expect(companyRepositoryMock.deactivate).toHaveBeenCalledWith('1');
    });

    it('deve lançar erro 404 quando empresa não existe', async () => {
        companyRepositoryMock.findById.mockResolvedValue(null);

        await expect(deleteCompanyService.execute('1')).rejects.toMatchObject({ statusCode: 404 });
        expect(companyRepositoryMock.deactivate).not.toHaveBeenCalled();
    });

    it('deve bloquear exclusão com funcionários vinculados', async () => {
        companyRepositoryMock.findById.mockResolvedValue({ id: '1', isActive: true });
        companyRepositoryMock.countEmployeesByCompanyId.mockResolvedValue(2);

        await expect(deleteCompanyService.execute('1')).rejects.toMatchObject({ statusCode: 409 });
        expect(companyRepositoryMock.deactivate).not.toHaveBeenCalled();
    });
});
