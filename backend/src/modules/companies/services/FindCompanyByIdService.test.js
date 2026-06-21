import { jest } from '@jest/globals';

const companyRepositoryMock = {
    findById: jest.fn()
};

jest.unstable_mockModule('../repositories/CompanyRepository.js', () => ({
    default: companyRepositoryMock
}));

const findCompanyByIdService = (await import('./FindCompanyByIdService.js')).default;

describe('FindCompanyByIdService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar empresa quando encontrada', async () => {
        const empresa = { id: '1', name: 'Empresa', cnpj: '1', isActive: true };
        companyRepositoryMock.findById.mockResolvedValue(empresa);

        const resultado = await findCompanyByIdService.execute('1');

        expect(resultado).toEqual(empresa);
    });

    it('deve lançar erro 404 quando empresa não existe', async () => {
        companyRepositoryMock.findById.mockResolvedValue(null);

        await expect(findCompanyByIdService.execute('1')).rejects.toMatchObject({
            message: 'Empresa não encontrada.',
            statusCode: 404
        });
    });
});
