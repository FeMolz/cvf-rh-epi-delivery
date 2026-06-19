import { jest } from '@jest/globals';

const quesitoRepositoryMock = {
    findById: jest.fn(),
    delete: jest.fn()
};

jest.unstable_mockModule('../repositories/QuesitoRepository.js', () => ({
    default: quesitoRepositoryMock
}));

const deleteQuesitoService = (await import('./DeleteQuesitoService.js')).default;

describe('DeleteQuesitoService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve excluir quesito existente', async () => {
        quesitoRepositoryMock.findById.mockResolvedValue({ id: 'q1', nome: 'Teste' });
        quesitoRepositoryMock.delete.mockResolvedValue({ id: 'q1' });

        const resultado = await deleteQuesitoService.execute('q1');

        expect(resultado.id).toBe('q1');
        expect(quesitoRepositoryMock.delete).toHaveBeenCalledWith('q1');
    });

    it('deve retornar 404 quando quesito não existir', async () => {
        quesitoRepositoryMock.findById.mockResolvedValue(null);

        await expect(deleteQuesitoService.execute('inexistente')).rejects.toMatchObject({
            message: 'Quesito não encontrado.',
            statusCode: 404
        });
    });
});
