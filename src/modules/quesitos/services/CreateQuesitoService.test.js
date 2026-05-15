import { jest } from '@jest/globals';

const quesitoRepositoryMock = {
    findByNome: jest.fn(),
    create: jest.fn()
};

jest.unstable_mockModule('../repositories/QuesitoRepository.js', () => ({
    default: quesitoRepositoryMock
}));

const createQuesitoService = (await import('./CreateQuesitoService.js')).default;

describe('CreateQuesitoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar quando nome, descricao e bloco sao validos', async () => {
        const criado = { id: '1', nome: 'x', descricao: 'd', bloco: 'b' };
        quesitoRepositoryMock.findByNome.mockResolvedValue(null);
        quesitoRepositoryMock.create.mockResolvedValue(criado);

        const resultado = await createQuesitoService.execute({
            nome: '  x  ',
            descricao: ' d ',
            bloco: ' b '
        });

        expect(quesitoRepositoryMock.findByNome).toHaveBeenCalledWith('x');
        expect(quesitoRepositoryMock.create).toHaveBeenCalledWith({
            nome: 'x',
            descricao: 'd',
            bloco: 'b'
        });
        expect(resultado).toEqual(criado);
    });

    it('deve rejeitar nome vazio', async () => {
        await expect(
            createQuesitoService.execute({ nome: '', descricao: 'd', bloco: 'b' })
        ).rejects.toThrow('nome e obrigatorio.');
    });

    it('deve rejeitar descricao vazia', async () => {
        await expect(
            createQuesitoService.execute({ nome: 'n', descricao: '   ', bloco: 'b' })
        ).rejects.toThrow('descricao e obrigatoria.');
    });

    it('deve rejeitar bloco vazio', async () => {
        await expect(
            createQuesitoService.execute({ nome: 'n', descricao: 'd', bloco: '' })
        ).rejects.toThrow('bloco e obrigatorio.');
    });

    it('deve rejeitar nome duplicado', async () => {
        quesitoRepositoryMock.findByNome.mockResolvedValue({ id: '1', nome: 'dup' });

        await expect(
            createQuesitoService.execute({ nome: 'dup', descricao: 'd', bloco: 'b' })
        ).rejects.toThrow('Ja existe um quesito com este nome.');

        expect(quesitoRepositoryMock.create).not.toHaveBeenCalled();
    });
});
