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
        const empresaAtualizada = { id: '1', name: 'NOVA', cnpj: '2', isActive: false };

        companyRepositoryMock.findById.mockResolvedValue(empresaAtual);
        companyRepositoryMock.findByCnpj.mockResolvedValue(null);
        companyRepositoryMock.update.mockResolvedValue(empresaAtualizada);

        const resultado = await updateCompanyService.execute('1', {
            name: 'NOVA',
            cnpj: '2',
            isActive: false
        });

        expect(companyRepositoryMock.update).toHaveBeenCalledWith('1', {
            name: 'NOVA',
            cnpj: '2',
            isActive: false
        });
        expect(resultado).toEqual(empresaAtualizada);
    });

    it('deve lançar erro 404 quando empresa não existe', async () => {
        companyRepositoryMock.findById.mockResolvedValue(null);

        await expect(
            updateCompanyService.execute('1', { name: 'NOVA', cnpj: '2' })
        ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('deve rejeitar CNPJ duplicado', async () => {
        companyRepositoryMock.findById.mockResolvedValue({ id: '1', name: 'A', cnpj: '1', isActive: true });
        companyRepositoryMock.findByCnpj.mockResolvedValue({ id: '2', cnpj: '2' });

        await expect(
            updateCompanyService.execute('1', { name: 'NOVA', cnpj: '2' })
        ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('deve rejeitar nome vazio', async () => {
        companyRepositoryMock.findById.mockResolvedValue({ id: '1', name: 'A', cnpj: '1', isActive: true });

        await expect(
            updateCompanyService.execute('1', { name: '  ', cnpj: '2' })
        ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('deve rejeitar CNPJ vazio', async () => {
        companyRepositoryMock.findById.mockResolvedValue({ id: '1', name: 'A', cnpj: '1', isActive: true });

        await expect(
            updateCompanyService.execute('1', { name: 'NOVA', cnpj: '  ' })
        ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('deve manter isActive da empresa quando não informado', async () => {
        companyRepositoryMock.findById.mockResolvedValue({ id: '1', name: 'A', cnpj: '1', isActive: false });
        companyRepositoryMock.findByCnpj.mockResolvedValue(null);
        companyRepositoryMock.update.mockResolvedValue({ id: '1', name: 'NOVA', cnpj: '2', isActive: false });

        await updateCompanyService.execute('1', { name: 'NOVA', cnpj: '2' });

        expect(companyRepositoryMock.update).toHaveBeenCalledWith('1', {
            name: 'NOVA',
            cnpj: '2',
            isActive: false
        });
    });

    it('deve rejeitar nome e cnpj não string', async () => {
        companyRepositoryMock.findById.mockResolvedValue({ id: '1', name: 'A', cnpj: '1', isActive: true });

        await expect(
            updateCompanyService.execute('1', { name: 123, cnpj: 456 })
        ).rejects.toMatchObject({ statusCode: 400 });
    });
});
