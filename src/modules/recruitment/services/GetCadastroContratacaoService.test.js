import { jest } from '@jest/globals';
import { MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO } from '../constants/recrutamentoConstantes.js';

const cadastroContratacaoRepositoryMock = { findById: jest.fn() };

jest.unstable_mockModule('../repositories/CadastroContratacaoRepository.js', () => ({
    default: cadastroContratacaoRepositoryMock
}));

const getCadastroContratacaoService = (await import('./GetCadastroContratacaoService.js')).default;

describe('GetCadastroContratacaoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar cadastro quando encontrado', async () => {
        const cadastro = { id: 'cad1', status: 'AGUARDANDO_ANALISE_RH' };
        cadastroContratacaoRepositoryMock.findById.mockResolvedValue(cadastro);

        const resultado = await getCadastroContratacaoService.execute('cad1');

        expect(resultado).toEqual(cadastro);
    });

    it('deve rejeitar quando cadastro nao existe', async () => {
        cadastroContratacaoRepositoryMock.findById.mockResolvedValue(null);

        await expect(getCadastroContratacaoService.execute('x')).rejects.toThrow(
            MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO
        );
    });
});
