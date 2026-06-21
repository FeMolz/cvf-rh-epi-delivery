import { jest } from '@jest/globals';

const companyRepositoryMock = {
    findById: jest.fn(),
    findByCnpj: jest.fn(),
    update: jest.fn()
};

jest.unstable_mockModule('../repositories/CompanyRepository.js', () => ({
    default: companyRepositoryMock
}));

const updateCompanyService = (await import('./UpdateCompanyService.js')).default;

describe('UpdateCompanyService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve atualizar empresa com sucesso', async () => {
        const empresaAtual = { id: '1', name: 'Antiga', cnpj: '1', isActive: true };
        const empresaAtualizada = { id: '1', name: 'Nova', cnpj: '2', isActive: false };

        companyRepositoryMock.findById.mockResolvedValue(empresaAtual);
        companyRepositoryMock.findByCnpj.mockResolvedValue(null);
        companyRepositoryMock.update.mockResolvedValue(empresaAtualizada);

        const resultado = await updateCompanyService.execute('1', {
            name: 'Nova',
            cnpj: '2',
            isActive: false
        });

        expect(companyRepositoryMock.update).toHaveBeenCalledWith('1', {
            name: 'Nova',
            cnpj: '2',
            isActive: false
        });
        expect(resultado).toEqual(empresaAtualizada);
    });

    it('deve lançar erro 404 quando empresa não existe', async () => {
        companyRepositoryMock.findById.mockResolvedValue(null);

        await expect(
            updateCompanyService.execute('1', { name: 'Nova', cnpj: '2' })
        ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('deve rejeitar CNPJ duplicado', async () => {
        companyRepositoryMock.findById.mockResolvedValue({ id: '1', name: 'A', cnpj: '1', isActive: true });
        companyRepositoryMock.findByCnpj.mockResolvedValue({ id: '2', cnpj: '2' });

        await expect(
            updateCompanyService.execute('1', { name: 'Nova', cnpj: '2' })
        ).rejects.toMatchObject({ statusCode: 409 });
    });
});
