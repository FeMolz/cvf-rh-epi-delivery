import { jest } from '@jest/globals';

const prismaMock = {
    company: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
    },
    employee: {
        count: jest.fn()
    }
};

jest.unstable_mockModule('../../../config/database.js', () => ({
    default: prismaMock
}));

const companyRepository = (await import('./CompanyRepository.js')).default;

const SELECAO_PADRAO = { id: true, name: true, cnpj: true, isActive: true };

describe('CompanyRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve listar empresas ordenadas por nome', async () => {
        const empresas = [{ id: '1', name: 'Alpha', cnpj: '1', isActive: true }];
        prismaMock.company.findMany.mockResolvedValue(empresas);

        const resultado = await companyRepository.findAllOrdered();

        expect(prismaMock.company.findMany).toHaveBeenCalledWith({
            select: SELECAO_PADRAO,
            orderBy: { name: 'asc' }
        });
        expect(resultado).toEqual(empresas);
    });

    it('deve buscar empresa por id', async () => {
        const empresa = { id: '1', name: 'Alpha', cnpj: '1', isActive: true };
        prismaMock.company.findUnique.mockResolvedValue(empresa);

        const resultado = await companyRepository.findById('1');

        expect(prismaMock.company.findUnique).toHaveBeenCalledWith({
            where: { id: '1' },
            select: SELECAO_PADRAO
        });
        expect(resultado).toEqual(empresa);
    });

    it('deve criar empresa', async () => {
        const dados = { name: 'Nova', cnpj: '2', isActive: true };
        prismaMock.company.create.mockResolvedValue({ id: '1', ...dados });

        await companyRepository.create(dados);

        expect(prismaMock.company.create).toHaveBeenCalledWith({
            data: dados,
            select: SELECAO_PADRAO
        });
    });

    it('deve criar empresa com isActive padrao true', async () => {
        const dados = { name: 'Nova', cnpj: '2' };
        prismaMock.company.create.mockResolvedValue({ id: '1', ...dados, isActive: true });

        await companyRepository.create(dados);

        expect(prismaMock.company.create).toHaveBeenCalledWith({
            data: { name: 'Nova', cnpj: '2', isActive: true },
            select: SELECAO_PADRAO
        });
    });

    it('deve desativar empresa', async () => {
        await companyRepository.deactivate('1');

        expect(prismaMock.company.update).toHaveBeenCalledWith({
            where: { id: '1' },
            data: { isActive: false },
            select: SELECAO_PADRAO
        });
    });

    it('deve contar funcionários vinculados', async () => {
        prismaMock.employee.count.mockResolvedValue(3);

        const resultado = await companyRepository.countEmployeesByCompanyId('1');

        expect(prismaMock.employee.count).toHaveBeenCalledWith({
            where: { companyId: '1', deletedAt: null }
        });
        expect(resultado).toBe(3);
    });

    it('deve buscar empresa por cnpj', async () => {
        const empresa = { id: '1', cnpj: '123' };
        prismaMock.company.findFirst.mockResolvedValue(empresa);

        const resultado = await companyRepository.findByCnpj('123');

        expect(prismaMock.company.findFirst).toHaveBeenCalledWith({
            where: { cnpj: '123' },
            select: SELECAO_PADRAO
        });
        expect(resultado).toEqual(empresa);
    });

    it('deve buscar empresa por cnpj excluindo id informado', async () => {
        prismaMock.company.findFirst.mockResolvedValue(null);

        await companyRepository.findByCnpj('123', '2');

        expect(prismaMock.company.findFirst).toHaveBeenCalledWith({
            where: { cnpj: '123', id: { not: '2' } },
            select: SELECAO_PADRAO
        });
    });

    it('deve atualizar empresa', async () => {
        const dados = { name: 'Atualizada', cnpj: '99', isActive: true };
        prismaMock.company.update.mockResolvedValue({ id: '1', ...dados });

        await companyRepository.update('1', dados);

        expect(prismaMock.company.update).toHaveBeenCalledWith({
            where: { id: '1' },
            data: dados,
            select: SELECAO_PADRAO
        });
    });
});
