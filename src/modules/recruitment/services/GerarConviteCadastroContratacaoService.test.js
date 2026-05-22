import { jest } from '@jest/globals';
import {
    MENSAGEM_CANDIDATURA_NAO_ENCONTRADA,
    MENSAGEM_CONVITE_CADASTRO_JA_EXISTE,
    MENSAGEM_VAGA_SEM_VINCULOS_CONTRATACAO,
    STATUS_CADASTRO_CONTRATACAO
} from '../constants/recrutamentoConstantes.js';

const candidaturaRepositoryMock = { findById: jest.fn() };
const cadastroContratacaoRepositoryMock = {
    findByCandidaturaId: jest.fn(),
    create: jest.fn()
};

jest.unstable_mockModule('../repositories/CandidaturaRepository.js', () => ({
    default: candidaturaRepositoryMock
}));

jest.unstable_mockModule('../repositories/CadastroContratacaoRepository.js', () => ({
    default: cadastroContratacaoRepositoryMock
}));

const gerarConviteCadastroContratacaoService = (
    await import('./GerarConviteCadastroContratacaoService.js')
).default;

describe('GerarConviteCadastroContratacaoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve gerar convite com url de cadastro', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue({
            id: 'c1',
            anuncioVaga: { roleId: 'r1', companyId: 'co1', setorId: 's1' }
        });
        cadastroContratacaoRepositoryMock.findByCandidaturaId.mockResolvedValue(null);
        cadastroContratacaoRepositoryMock.create.mockImplementation((dados) =>
            Promise.resolve({ id: 'cad1', tokenAcesso: dados.tokenAcesso })
        );

        const resultado = await gerarConviteCadastroContratacaoService.execute('c1');

        expect(cadastroContratacaoRepositoryMock.create).toHaveBeenCalled();
        expect(resultado.urlCadastro).toContain(resultado.tokenAcesso);
        expect(resultado.urlCadastro).toContain('/publico/cadastro-contratacao/');
    });

    it('deve rejeitar candidatura inexistente', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue(null);

        await expect(gerarConviteCadastroContratacaoService.execute('x')).rejects.toThrow(
            MENSAGEM_CANDIDATURA_NAO_ENCONTRADA
        );
    });

    it('deve rejeitar vaga sem vinculos de contratacao', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue({
            id: 'c1',
            anuncioVaga: { roleId: null, companyId: 'co1', setorId: 's1' }
        });

        await expect(gerarConviteCadastroContratacaoService.execute('c1')).rejects.toThrow(
            MENSAGEM_VAGA_SEM_VINCULOS_CONTRATACAO
        );
    });

    it('deve rejeitar convite ativo duplicado', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue({
            id: 'c1',
            anuncioVaga: { roleId: 'r1', companyId: 'co1', setorId: 's1' }
        });
        cadastroContratacaoRepositoryMock.findByCandidaturaId.mockResolvedValue({
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO
        });

        await expect(gerarConviteCadastroContratacaoService.execute('c1')).rejects.toThrow(
            MENSAGEM_CONVITE_CADASTRO_JA_EXISTE
        );
    });
});
