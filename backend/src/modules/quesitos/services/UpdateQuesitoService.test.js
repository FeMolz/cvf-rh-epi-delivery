import { jest } from '@jest/globals';
import {
    MENSAGEM_BLOCO_QUESITO_OBRIGATORIO,
    MENSAGEM_CAMPOS_ATUALIZACAO_QUESITO_VAZIOS,
    MENSAGEM_DESCRICAO_QUESITO_OBRIGATORIA,
    MENSAGEM_NOME_QUESITO_JA_CADASTRADO,
    MENSAGEM_NOME_QUESITO_OBRIGATORIO,
    MENSAGEM_QUESITO_NAO_ENCONTRADO
} from '../constants/quesitoConstantes.js';

const quesitoRepositoryMock = {
    findById: jest.fn(),
    findByNome: jest.fn(),
    update: jest.fn()
};

jest.unstable_mockModule('../repositories/QuesitoRepository.js', () => ({
    default: quesitoRepositoryMock
}));

const updateQuesitoService = (await import('./UpdateQuesitoService.js')).default;

describe('UpdateQuesitoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve atualizar quesito quando dados sao validos', async () => {
        const existente = {
            id: '1',
            nome: 'antigo',
            descricao: 'desc',
            bloco: 'SST'
        };
        const atualizado = { ...existente, descricao: 'nova descricao' };
        quesitoRepositoryMock.findById.mockResolvedValue(existente);
        quesitoRepositoryMock.update.mockResolvedValue(atualizado);

        const resultado = await updateQuesitoService.execute('1', { descricao: 'nova descricao' });

        expect(quesitoRepositoryMock.update).toHaveBeenCalledWith('1', {
            descricao: 'nova descricao'
        });
        expect(resultado).toEqual(atualizado);
    });

    it('deve retornar erro quando quesito nao existe', async () => {
        quesitoRepositoryMock.findById.mockResolvedValue(null);

        await expect(updateQuesitoService.execute('99', { nome: 'novo' })).rejects.toThrow(
            MENSAGEM_QUESITO_NAO_ENCONTRADO
        );
    });

    it('deve rejeitar quando nenhum campo e informado', async () => {
        quesitoRepositoryMock.findById.mockResolvedValue({ id: '1', nome: 'a' });

        await expect(updateQuesitoService.execute('1', {})).rejects.toThrow(
            MENSAGEM_CAMPOS_ATUALIZACAO_QUESITO_VAZIOS
        );
    });

    it('deve rejeitar quando entrada e indefinida', async () => {
        quesitoRepositoryMock.findById.mockResolvedValue({ id: '1', nome: 'a' });

        await expect(updateQuesitoService.execute('1', undefined)).rejects.toThrow(
            MENSAGEM_CAMPOS_ATUALIZACAO_QUESITO_VAZIOS
        );
    });

    it('deve rejeitar nome duplicado de outro quesito', async () => {
        quesitoRepositoryMock.findById.mockResolvedValue({ id: '1', nome: 'antigo' });
        quesitoRepositoryMock.findByNome.mockResolvedValue({ id: '2', nome: 'duplicado' });

        await expect(updateQuesitoService.execute('1', { nome: 'duplicado' })).rejects.toThrow(
            MENSAGEM_NOME_QUESITO_JA_CADASTRADO
        );
    });

    it('deve rejeitar nome vazio', async () => {
        quesitoRepositoryMock.findById.mockResolvedValue({ id: '1', nome: 'antigo' });

        await expect(updateQuesitoService.execute('1', { nome: '   ' })).rejects.toThrow(
            MENSAGEM_NOME_QUESITO_OBRIGATORIO
        );
    });

    it('deve rejeitar descricao vazia', async () => {
        quesitoRepositoryMock.findById.mockResolvedValue({ id: '1', nome: 'antigo' });

        await expect(updateQuesitoService.execute('1', { descricao: '' })).rejects.toThrow(
            MENSAGEM_DESCRICAO_QUESITO_OBRIGATORIA
        );
    });

    it('deve rejeitar bloco vazio', async () => {
        quesitoRepositoryMock.findById.mockResolvedValue({ id: '1', nome: 'antigo' });

        await expect(updateQuesitoService.execute('1', { bloco: '' })).rejects.toThrow(
            MENSAGEM_BLOCO_QUESITO_OBRIGATORIO
        );
    });
});
