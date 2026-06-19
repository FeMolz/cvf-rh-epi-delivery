import { jest } from '@jest/globals';

const companyRepositoryMock = {
    findAllOrdered: jest.fn()
};

jest.unstable_mockModule('../repositories/CompanyRepository.js', () => ({
    default: companyRepositoryMock
}));

const listCompaniesService = (await import('./ListCompaniesService.js')).default;

describe('ListCompaniesService', () => {
    it('deve retornar empresas ordenadas', async () => {
        const empresas = [{ id: '1', name: 'Empresa A' }];
        companyRepositoryMock.findAllOrdered.mockResolvedValue(empresas);

        const resultado = await listCompaniesService.execute();

        expect(companyRepositoryMock.findAllOrdered).toHaveBeenCalledTimes(1);
        expect(resultado).toEqual(empresas);
    });
});
