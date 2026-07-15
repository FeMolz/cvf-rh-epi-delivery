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
            createdAt: new Date(),
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

    it('deve priorizar dados do cadastro sobre sugestao da candidatura', async () => {
        cadastroContratacaoRepositoryMock.findByToken.mockResolvedValue({
            tokenAcesso: 'token-2',
            createdAt: new Date(),
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO,
            name: 'João Cadastro',
            email: 'joao@cadastro.com',
            telefone: '11988887777',
            cpf: '529.982.247-25',
            role: { id: 'r1' },
            company: { id: 'c1' },
            setor: { id: 's1' },
            candidatura: {
                nomeCompleto: 'Maria Candidata',
                email: 'maria@candidatura.com',
                telefone: '11999999999',
                cpf: '111.111.111-11'
            }
        });

        const resultado = await getCadastroContratacaoPublicoService.execute('token-2');

        expect(resultado.sugestaoPreenchimento).toEqual({
            name: 'João Cadastro',
            email: 'joao@cadastro.com',
            telefone: '11988887777',
            cpf: '529.982.247-25'
        });
    });

    it('deve retornar null na sugestao quando cadastro e candidatura nao possuem dados', async () => {
        cadastroContratacaoRepositoryMock.findByToken.mockResolvedValue({
            tokenAcesso: 'token-3',
            createdAt: new Date(),
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO,
            role: { id: 'r1' },
            company: { id: 'c1' },
            setor: { id: 's1' },
            candidatura: null
        });

        const resultado = await getCadastroContratacaoPublicoService.execute('token-3');

        expect(resultado.sugestaoPreenchimento).toEqual({
            name: null,
            email: null,
            telefone: null,
            cpf: null
        });
    });

    it('deve rejeitar token nao-string', async () => {
        await expect(getCadastroContratacaoPublicoService.execute(null)).rejects.toThrow(
            MENSAGEM_TOKEN_CADASTRO_INVALIDO
        );
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

    it('deve rejeitar token expirado', async () => {
        cadastroContratacaoRepositoryMock.findByToken.mockResolvedValue({
            createdAt: new Date('2020-01-01'),
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO
        });

        await expect(getCadastroContratacaoPublicoService.execute('token')).rejects.toThrow(
            MENSAGEM_TOKEN_CADASTRO_INVALIDO
        );
    });

    it('deve rejeitar quando status nao permite preenchimento', async () => {
        cadastroContratacaoRepositoryMock.findByToken.mockResolvedValue({
            createdAt: new Date(),
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH
        });

        await expect(getCadastroContratacaoPublicoService.execute('token')).rejects.toThrow(
            MENSAGEM_CADASTRO_NAO_DISPONIVEL_PREENCHIMENTO
        );
    });
});
