import { jest } from '@jest/globals';

const prismaMock = {
    setor: {
        findMany: jest.fn()
    }
};

jest.unstable_mockModule('../../../config/database.js', () => ({
    default: prismaMock
}));

const setorRepository = (await import('./SetorRepository.js')).default;

describe('SetorRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve listar setores ordenados por nome', async () => {
        const setores = [{ id: '1', nome: 'Administrativo', isActive: true }];
        prismaMock.setor.findMany.mockResolvedValue(setores);

        const resultado = await setorRepository.findAllOrdered();

        expect(prismaMock.setor.findMany).toHaveBeenCalledWith({
            select: { id: true, nome: true, isActive: true },
            orderBy: { nome: 'asc' }
        });
        expect(resultado).toEqual(setores);
    });
});
