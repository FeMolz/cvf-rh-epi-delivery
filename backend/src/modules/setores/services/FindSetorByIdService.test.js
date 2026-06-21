import { jest } from '@jest/globals';

const setorRepositoryMock = {
    findById: jest.fn()
};

jest.unstable_mockModule('../repositories/SetorRepository.js', () => ({
    default: setorRepositoryMock
}));

const findSetorByIdService = (await import('./FindSetorByIdService.js')).default;

describe('FindSetorByIdService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar setor quando encontrado', async () => {
        const setor = { id: '1', nome: 'TI', isActive: true };
        setorRepositoryMock.findById.mockResolvedValue(setor);

        const resultado = await findSetorByIdService.execute('1');

        expect(resultado).toEqual(setor);
    });

    it('deve lançar erro 404 quando setor não existe', async () => {
        setorRepositoryMock.findById.mockResolvedValue(null);

        await expect(findSetorByIdService.execute('1')).rejects.toMatchObject({
            message: 'Setor não encontrado.',
            statusCode: 404
        });
    });
});
