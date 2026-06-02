import { jest } from '@jest/globals';
import {
    MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO,
    MENSAGEM_CADASTRO_NAO_DISPONIVEL_PREENCHIMENTO,
    MENSAGEM_TOKEN_CADASTRO_INVALIDO,
    STATUS_CADASTRO_CONTRATACAO
} from '../constants/recrutamentoConstantes.js';

const cadastroContratacaoRepositoryMock = { findByToken: jest.fn() };

jest.unstable_mockModule('../repositories/CadastroContratacaoRepository.js', () => ({
    default: cadastroContratacaoRepositoryMock
}));

const getCadastroContratacaoPublicoService = (
    await import('./GetCadastroContratacaoPublicoService.js')
).default;

describe('GetCadastroContratacaoPublicoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar formulario publico com campos bloqueados', async () => {
        cadastroContratacaoRepositoryMock.findByToken.mockResolvedValue({
            tokenAcesso: 'token-1',
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO,
            role: { id: 'r1', name: 'Analista' },
            company: { id: 'c1', name: 'Empresa' },
            setor: { id: 's1', nome: 'RH' },
            candidatura: { nomeCompleto: 'Maria', email: 'm@e.com', telefone: '11', cpf: null }
        });

        const resultado = await getCadastroContratacaoPublicoService.execute('token-1');

        expect(resultado.cargoBloqueado).toBe(true);
        expect(resultado.sugestaoPreenchimento.name).toBe('Maria');
        expect(resultado.camposPermitidosCandidato.obrigatorios).toContain('birthDate');
        expect(resultado.dadosPreenchidos).not.toHaveProperty('valeTransporte');
    });

    it('deve rejeitar token vazio', async () => {
        await expect(getCadastroContratacaoPublicoService.execute('  ')).rejects.toThrow(
            MENSAGEM_TOKEN_CADASTRO_INVALIDO
        );
    });

    it('deve rejeitar cadastro inexistente', async () => {
        cadastroContratacaoRepositoryMock.findByToken.mockResolvedValue(null);

        await expect(getCadastroContratacaoPublicoService.execute('x')).rejects.toThrow(
            MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO
        );
    });

    it('deve rejeitar quando status nao permite preenchimento', async () => {
        cadastroContratacaoRepositoryMock.findByToken.mockResolvedValue({
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH
        });

        await expect(getCadastroContratacaoPublicoService.execute('token')).rejects.toThrow(
            MENSAGEM_CADASTRO_NAO_DISPONIVEL_PREENCHIMENTO
        );
    });
});
