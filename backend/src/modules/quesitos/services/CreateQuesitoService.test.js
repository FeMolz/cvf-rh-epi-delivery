import { jest } from '@jest/globals';
import {
    MENSAGEM_BLOCO_QUESITO_OBRIGATORIO,
    MENSAGEM_DESCRICAO_QUESITO_OBRIGATORIA,
    MENSAGEM_NOME_QUESITO_JA_CADASTRADO,
    MENSAGEM_NOME_QUESITO_OBRIGATORIO
} from '../constants/quesitoConstantes.js';

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
        ).rejects.toThrow(MENSAGEM_NOME_QUESITO_OBRIGATORIO);
    });

    it('deve rejeitar descricao vazia', async () => {
        await expect(
            createQuesitoService.execute({ nome: 'n', descricao: '   ', bloco: 'b' })
        ).rejects.toThrow(MENSAGEM_DESCRICAO_QUESITO_OBRIGATORIA);
    });

    it('deve rejeitar bloco vazio', async () => {
        await expect(
            createQuesitoService.execute({ nome: 'n', descricao: 'd', bloco: '' })
        ).rejects.toThrow(MENSAGEM_BLOCO_QUESITO_OBRIGATORIO);
    });

    it('deve rejeitar nome duplicado', async () => {
        quesitoRepositoryMock.findByNome.mockResolvedValue({ id: '1', nome: 'dup' });

        await expect(
            createQuesitoService.execute({ nome: 'dup', descricao: 'd', bloco: 'b' })
        ).rejects.toThrow(MENSAGEM_NOME_QUESITO_JA_CADASTRADO);

        expect(quesitoRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('deve rejeitar campos que não são string', async () => {
        await expect(
            createQuesitoService.execute({ nome: 123, descricao: 'd', bloco: 'b' })
        ).rejects.toThrow(MENSAGEM_NOME_QUESITO_OBRIGATORIO);

        await expect(
            createQuesitoService.execute({ nome: 'n', descricao: 456, bloco: 'b' })
        ).rejects.toThrow(MENSAGEM_DESCRICAO_QUESITO_OBRIGATORIA);

        await expect(
            createQuesitoService.execute({ nome: 'n', descricao: 'd', bloco: null })
        ).rejects.toThrow(MENSAGEM_BLOCO_QUESITO_OBRIGATORIO);
    });
});
