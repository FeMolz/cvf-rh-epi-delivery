import { jest } from '@jest/globals';

const prismaMock = {
    company: {
        findMany: jest.fn()
    }
};

jest.unstable_mockModule('../../../config/database.js', () => ({
    default: prismaMock
}));

const companyRepository = (await import('./CompanyRepository.js')).default;

describe('CompanyRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve listar empresas ordenadas por nome', async () => {
        const empresas = [{ id: '1', name: 'Alpha', cnpj: '1', isActive: true }];
        prismaMock.company.findMany.mockResolvedValue(empresas);

        const resultado = await companyRepository.findAllOrdered();

        expect(prismaMock.company.findMany).toHaveBeenCalledWith({
            select: { id: true, name: true, cnpj: true, isActive: true },
            orderBy: { name: 'asc' }
        });
        expect(resultado).toEqual(empresas);
    });
});
