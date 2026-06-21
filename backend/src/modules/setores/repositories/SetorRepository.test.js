import { jest } from '@jest/globals';

const prismaMock = {
    setor: {
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

const setorRepository = (await import('./SetorRepository.js')).default;

const SELECAO_PADRAO = { id: true, nome: true, isActive: true };

describe('SetorRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve listar setores ordenados por nome', async () => {
        const setores = [{ id: '1', nome: 'Administrativo', isActive: true }];
        prismaMock.setor.findMany.mockResolvedValue(setores);

        const resultado = await setorRepository.findAllOrdered();

        expect(prismaMock.setor.findMany).toHaveBeenCalledWith({
            select: SELECAO_PADRAO,
            orderBy: { nome: 'asc' }
        });
        expect(resultado).toEqual(setores);
    });

    it('deve buscar setor por id', async () => {
        const setor = { id: '1', nome: 'TI', isActive: true };
        prismaMock.setor.findUnique.mockResolvedValue(setor);

        const resultado = await setorRepository.findById('1');

        expect(prismaMock.setor.findUnique).toHaveBeenCalledWith({
            where: { id: '1' },
            select: SELECAO_PADRAO
        });
        expect(resultado).toEqual(setor);
    });

    it('deve criar setor', async () => {
        const dados = { nome: 'TI', isActive: true };
        prismaMock.setor.create.mockResolvedValue({ id: '1', ...dados });

        await setorRepository.create(dados);

        expect(prismaMock.setor.create).toHaveBeenCalledWith({
            data: dados,
            select: SELECAO_PADRAO
        });
    });

    it('deve desativar setor', async () => {
        await setorRepository.deactivate('1');

        expect(prismaMock.setor.update).toHaveBeenCalledWith({
            where: { id: '1' },
            data: { isActive: false },
            select: SELECAO_PADRAO
        });
    });

    it('deve contar funcionários vinculados', async () => {
        prismaMock.employee.count.mockResolvedValue(2);

        const resultado = await setorRepository.countEmployeesBySetorId('1');

        expect(prismaMock.employee.count).toHaveBeenCalledWith({
            where: { setorId: '1', deletedAt: null }
        });
        expect(resultado).toBe(2);
    });
});
