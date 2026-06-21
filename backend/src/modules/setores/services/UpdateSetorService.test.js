import { jest } from '@jest/globals';

const setorRepositoryMock = {
    findById: jest.fn(),
    findByNome: jest.fn(),
    update: jest.fn()
};

jest.unstable_mockModule('../repositories/SetorRepository.js', () => ({
    default: setorRepositoryMock
}));

const updateSetorService = (await import('./UpdateSetorService.js')).default;

describe('UpdateSetorService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve atualizar setor com sucesso', async () => {
        const setorAtual = { id: '1', nome: 'TI', isActive: true };
        const setorAtualizado = { id: '1', nome: 'Tecnologia', isActive: false };

        setorRepositoryMock.findById.mockResolvedValue(setorAtual);
        setorRepositoryMock.findByNome.mockResolvedValue(null);
        setorRepositoryMock.update.mockResolvedValue(setorAtualizado);

        const resultado = await updateSetorService.execute('1', {
            nome: 'Tecnologia',
            isActive: false
        });

        expect(setorRepositoryMock.update).toHaveBeenCalledWith('1', {
            nome: 'Tecnologia',
            isActive: false
        });
        expect(resultado).toEqual(setorAtualizado);
    });

    it('deve lançar erro 404 quando setor não existe', async () => {
        setorRepositoryMock.findById.mockResolvedValue(null);

        await expect(updateSetorService.execute('1', { nome: 'TI' })).rejects.toMatchObject({
            statusCode: 404
        });
    });

    it('deve rejeitar nome duplicado', async () => {
        setorRepositoryMock.findById.mockResolvedValue({ id: '1', nome: 'TI', isActive: true });
        setorRepositoryMock.findByNome.mockResolvedValue({ id: '2', nome: 'RH' });

        await expect(updateSetorService.execute('1', { nome: 'RH' })).rejects.toMatchObject({
            statusCode: 409
        });
    });
});
