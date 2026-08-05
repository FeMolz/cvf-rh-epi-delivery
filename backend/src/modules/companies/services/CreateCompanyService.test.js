import { jest } from '@jest/globals';

const companyRepositoryMock = {
    findByCnpj: jest.fn(),
    create: jest.fn()
};

jest.unstable_mockModule('../repositories/CompanyRepository.js', () => ({
    default: companyRepositoryMock
}));

const createCompanyService = (await import('./CreateCompanyService.js')).default;

describe('CreateCompanyService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar empresa com sucesso', async () => {
        const dados = { name: 'EMPRESA NOVA', cnpj: '11.111.111/0001-11' };
        const empresaCriada = { id: '1', ...dados, isActive: true };

        companyRepositoryMock.findByCnpj.mockResolvedValue(null);
        companyRepositoryMock.create.mockResolvedValue(empresaCriada);

        const resultado = await createCompanyService.execute(dados);

        expect(companyRepositoryMock.findByCnpj).toHaveBeenCalledWith('11.111.111/0001-11');
        expect(companyRepositoryMock.create).toHaveBeenCalledWith({
            name: 'EMPRESA NOVA',
            cnpj: '11.111.111/0001-11',
            isActive: true
        });
        expect(resultado).toEqual(empresaCriada);
    });

    it('deve rejeitar nome vazio', async () => {
        await expect(createCompanyService.execute({ name: '  ', cnpj: '1' })).rejects.toThrow(
            'O nome da empresa é obrigatório.'
        );
        expect(companyRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('deve rejeitar CNPJ vazio', async () => {
        await expect(createCompanyService.execute({ name: 'Empresa', cnpj: '  ' })).rejects.toThrow(
            'O CNPJ da empresa é obrigatório.'
        );
        expect(companyRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('deve rejeitar CNPJ duplicado', async () => {
        companyRepositoryMock.findByCnpj.mockResolvedValue({ id: '2', cnpj: '1' });

        await expect(
            createCompanyService.execute({ name: 'Empresa', cnpj: '11.111.111/0001-11' })
        ).rejects.toThrow('Já existe uma empresa cadastrada com este CNPJ.');
        expect(companyRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('deve criar empresa inativa quando isActive for false', async () => {
        companyRepositoryMock.findByCnpj.mockResolvedValue(null);
        companyRepositoryMock.create.mockResolvedValue({
            id: '1',
            name: 'Empresa',
            cnpj: '11.111.111/0001-11',
            isActive: false
        });

        await createCompanyService.execute({
            name: 'Empresa',
            cnpj: '11.111.111/0001-11',
            isActive: false
        });

        expect(companyRepositoryMock.create).toHaveBeenCalledWith({
            name: 'EMPRESA',
            cnpj: '11.111.111/0001-11',
            isActive: false
        });
    });

    it('deve rejeitar nome e cnpj não string', async () => {
        await expect(createCompanyService.execute({ name: 123, cnpj: 456 })).rejects.toThrow(
            'O nome da empresa é obrigatório.'
        );
    });
});
