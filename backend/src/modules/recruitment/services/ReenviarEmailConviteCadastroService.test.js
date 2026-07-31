import { jest } from '@jest/globals';
import {
    MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO,
    MENSAGEM_FALHA_ENVIO_CONVITE_CADASTRO,
    MENSAGEM_REENVIAR_EMAIL_STATUS_INVALIDO,
    MENSAGEM_TOKEN_CADASTRO_INVALIDO,
    STATUS_CADASTRO_CONTRATACAO
} from '../constants/recrutamentoConstantes.js';

const cadastroContratacaoRepositoryMock = { findById: jest.fn() };
const enviarEmailMock = { execute: jest.fn() };
const tokenExpiradoMock = jest.fn(() => false);

jest.unstable_mockModule('../repositories/CadastroContratacaoRepository.js', () => ({
    default: cadastroContratacaoRepositoryMock
}));

jest.unstable_mockModule('./EnviarEmailConviteCadastroService.js', () => ({
    default: enviarEmailMock
}));

jest.unstable_mockModule('../../../config/env.js', () => ({
    default: { FRONTEND_PUBLIC_URL: 'http://localhost:5173' }
}));

jest.unstable_mockModule('../utils/tokenCadastroContratacaoExpirado.js', () => ({
    tokenCadastroContratacaoExpirado: tokenExpiradoMock
}));

const reenviarEmailConviteCadastroService = (
    await import('./ReenviarEmailConviteCadastroService.js')
).default;

describe('ReenviarEmailConviteCadastroService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        tokenExpiradoMock.mockReturnValue(false);
        enviarEmailMock.execute.mockResolvedValue(undefined);
    });

    it('deve reenviar e-mail para cadastro aguardando preenchimento', async () => {
        cadastroContratacaoRepositoryMock.findById.mockResolvedValue({
            id: 'cad1',
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO,
            tokenAcesso: 'tok',
            createdAt: new Date(),
            candidatura: { email: 'cand@email.com', nomeCompleto: 'Maria' }
        });

        const resultado = await reenviarEmailConviteCadastroService.execute('cad1');

        expect(enviarEmailMock.execute).toHaveBeenCalled();
        expect(resultado.emailEnviadoPara).toBe('cand@email.com');
        expect(resultado.urlCadastroAbsoluta).toContain('/publico/cadastro-contratacao/tok');
    });

    it('deve rejeitar cadastro inexistente', async () => {
        cadastroContratacaoRepositoryMock.findById.mockResolvedValue(null);

        await expect(reenviarEmailConviteCadastroService.execute('x')).rejects.toThrow(
            MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO
        );
    });

    it('deve rejeitar token expirado', async () => {
        tokenExpiradoMock.mockReturnValue(true);
        cadastroContratacaoRepositoryMock.findById.mockResolvedValue({
            id: 'cad1',
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO,
            createdAt: new Date('2020-01-01')
        });

        await expect(reenviarEmailConviteCadastroService.execute('cad1')).rejects.toThrow(
            MENSAGEM_TOKEN_CADASTRO_INVALIDO
        );
    });

    it('deve rejeitar falha no envio de e-mail', async () => {
        cadastroContratacaoRepositoryMock.findById.mockResolvedValue({
            id: 'cad1',
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO,
            tokenAcesso: 'tok',
            createdAt: new Date(),
            email: 'cand@email.com',
            name: 'Maria'
        });
        enviarEmailMock.execute.mockRejectedValue(new Error('smtp'));

        await expect(reenviarEmailConviteCadastroService.execute('cad1')).rejects.toThrow(
            MENSAGEM_FALHA_ENVIO_CONVITE_CADASTRO
        );
    });

    it('deve rejeitar status diferente de AGUARDANDO_PREENCHIMENTO', async () => {
        cadastroContratacaoRepositoryMock.findById.mockResolvedValue({
            id: 'cad1',
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH
        });

        await expect(reenviarEmailConviteCadastroService.execute('cad1')).rejects.toThrow(
            MENSAGEM_REENVIAR_EMAIL_STATUS_INVALIDO
        );
    });
});
