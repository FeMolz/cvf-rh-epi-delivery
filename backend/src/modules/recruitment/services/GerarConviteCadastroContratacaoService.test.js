import { jest } from '@jest/globals';
import {
    MENSAGEM_CANDIDATURA_NAO_ENCONTRADA,
    MENSAGEM_CONVITE_CADASTRO_JA_EXISTE,
    MENSAGEM_CONVITE_EXIGE_PROXIMA_FASE,
    MENSAGEM_FALHA_ENVIO_CONVITE_CADASTRO,
    MENSAGEM_VAGA_SEM_VINCULOS_CONTRATACAO,
    STATUS_CADASTRO_CONTRATACAO,
    STATUS_CANDIDATURA
} from '../constants/recrutamentoConstantes.js';

const candidaturaRepositoryMock = { findById: jest.fn() };
const cadastroContratacaoRepositoryMock = {
    findByCandidaturaId: jest.fn(),
    create: jest.fn(),
    delete: jest.fn()
};
const enviarEmailMock = { execute: jest.fn() };

jest.unstable_mockModule('../repositories/CandidaturaRepository.js', () => ({
    default: candidaturaRepositoryMock
}));

jest.unstable_mockModule('../repositories/CadastroContratacaoRepository.js', () => ({
    default: cadastroContratacaoRepositoryMock
}));

jest.unstable_mockModule('./EnviarEmailConviteCadastroService.js', () => ({
    default: enviarEmailMock
}));

jest.unstable_mockModule('../../../config/env.js', () => ({
    default: { FRONTEND_PUBLIC_URL: 'http://localhost:5173' }
}));

jest.unstable_mockModule('../../../shared/utils/registrarEventoAuditoria.js', () => ({
    registrarEventoAuditoria: jest.fn(),
    TIPOS_EVENTO_AUDITORIA: { CONVITE_CADASTRO_GERADO: 'CONVITE_CADASTRO_GERADO' }
}));

const gerarConviteCadastroContratacaoService = (
    await import('./GerarConviteCadastroContratacaoService.js')
).default;

describe('GerarConviteCadastroContratacaoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        enviarEmailMock.execute.mockResolvedValue(undefined);
    });

    it('deve gerar convite, enviar e-mail e retornar url absoluta', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue({
            id: 'c1',
            status: STATUS_CANDIDATURA.PROXIMA_FASE,
            email: 'cand@email.com',
            nomeCompleto: 'Maria',
            anuncioVaga: { roleId: 'r1', companyId: 'co1', setorId: 's1' }
        });
        cadastroContratacaoRepositoryMock.findByCandidaturaId.mockResolvedValue(null);
        cadastroContratacaoRepositoryMock.create.mockImplementation((dados) =>
            Promise.resolve({ id: 'cad1', tokenAcesso: dados.tokenAcesso })
        );

        const resultado = await gerarConviteCadastroContratacaoService.execute('c1');

        expect(cadastroContratacaoRepositoryMock.create).toHaveBeenCalled();
        expect(enviarEmailMock.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                emailDestinatario: 'cand@email.com',
                nomeCandidato: 'Maria'
            })
        );
        expect(resultado.urlCadastro).toContain(resultado.tokenAcesso);
        expect(resultado.urlCadastroAbsoluta).toContain('http://localhost:5173/publico/cadastro-contratacao/');
        expect(resultado.emailEnviadoPara).toBe('cand@email.com');
    });

    it('deve rejeitar candidatura inexistente', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue(null);

        await expect(gerarConviteCadastroContratacaoService.execute('x')).rejects.toThrow(
            MENSAGEM_CANDIDATURA_NAO_ENCONTRADA
        );
    });

    it('deve exigir status PROXIMA_FASE', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue({
            id: 'c1',
            status: STATUS_CANDIDATURA.PENDENTE,
            anuncioVaga: { roleId: 'r1', companyId: 'co1', setorId: 's1' }
        });

        await expect(gerarConviteCadastroContratacaoService.execute('c1')).rejects.toThrow(
            MENSAGEM_CONVITE_EXIGE_PROXIMA_FASE
        );
    });

    it('deve rejeitar vaga sem vinculos de contratacao', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue({
            id: 'c1',
            status: STATUS_CANDIDATURA.PROXIMA_FASE,
            anuncioVaga: { roleId: null, companyId: 'co1', setorId: 's1' }
        });

        await expect(gerarConviteCadastroContratacaoService.execute('c1')).rejects.toThrow(
            MENSAGEM_VAGA_SEM_VINCULOS_CONTRATACAO
        );
    });

    it('deve rejeitar convite ativo duplicado', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue({
            id: 'c1',
            status: STATUS_CANDIDATURA.PROXIMA_FASE,
            anuncioVaga: { roleId: 'r1', companyId: 'co1', setorId: 's1' }
        });
        cadastroContratacaoRepositoryMock.findByCandidaturaId.mockResolvedValue({
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO
        });

        await expect(gerarConviteCadastroContratacaoService.execute('c1')).rejects.toThrow(
            MENSAGEM_CONVITE_CADASTRO_JA_EXISTE
        );
    });

    it('deve fazer rollback se o e-mail falhar', async () => {
        candidaturaRepositoryMock.findById.mockResolvedValue({
            id: 'c1',
            status: STATUS_CANDIDATURA.PROXIMA_FASE,
            email: 'cand@email.com',
            nomeCompleto: 'Maria',
            anuncioVaga: { roleId: 'r1', companyId: 'co1', setorId: 's1' }
        });
        cadastroContratacaoRepositoryMock.findByCandidaturaId.mockResolvedValue(null);
        cadastroContratacaoRepositoryMock.create.mockResolvedValue({ id: 'cad1', tokenAcesso: 'tok' });
        enviarEmailMock.execute.mockRejectedValue(new Error('smtp'));

        await expect(gerarConviteCadastroContratacaoService.execute('c1')).rejects.toThrow(
            MENSAGEM_FALHA_ENVIO_CONVITE_CADASTRO
        );
        expect(cadastroContratacaoRepositoryMock.delete).toHaveBeenCalledWith('cad1');
    });
});
