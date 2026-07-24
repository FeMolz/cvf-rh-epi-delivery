import { describe, expect, it, vi } from 'vitest';

import {
    atualizarStatusCandidatura,
    candidatarSePublico,
    gerarConviteCadastro,
    listarCadastrosContratacao,
    listarTodasCandidaturas,
    listarVagasAdmin,
    listarVagasAtivas,
    listarVagasPublicas,
    obterVagaAtiva,
    obterVagaPublica,
    reativarCandidatura,
    reenviarEmailConviteCadastro,
    marcarVisualizacaoCandidatura
} from './recrutamentoApi.js';

vi.mock('../../../shared/api/clienteHttp.js', () => ({
    requisicaoApi: vi.fn(),
    baixarArquivoApi: vi.fn()
}));

const { requisicaoApi } = await import('../../../shared/api/clienteHttp.js');

describe('recrutamentoApi', () => {
    it('deve listar vagas publicas sem token', async () => {
        requisicaoApi.mockResolvedValue([]);

        await listarVagasPublicas();

        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/publico/vagas');
    });

    it('deve obter vaga publica por id', async () => {
        requisicaoApi.mockResolvedValue({ id: 'v1' });

        await obterVagaPublica('v1');

        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/publico/vagas/v1');
    });

    it('deve candidatar-se publicamente via FormData', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ id: 'c1' })
        });
        vi.stubGlobal('fetch', fetchMock);

        const formData = new FormData();
        formData.append('nomeCompleto', 'Maria');

        await candidatarSePublico('v1', formData);

        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/recruitment/publico/vagas/v1/candidaturas'),
            expect.objectContaining({
                method: 'POST',
                body: formData
            })
        );

        vi.unstubAllGlobals();
    });

    it('deve listar vagas ativas', async () => {
        requisicaoApi.mockResolvedValue([]);

        await listarVagasAtivas('jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/vagas/ativas', { token: 'jwt' });
    });

    it('deve obter vaga ativa por id', async () => {
        requisicaoApi.mockResolvedValue({ id: 'v1' });

        await obterVagaAtiva('v1', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/vagas/ativas/v1', { token: 'jwt' });
    });

    it('deve listar vagas admin com filtro de status', async () => {
        requisicaoApi.mockResolvedValue([]);

        await listarVagasAdmin('jwt', { status: 'ATIVA' });

        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/vagas?status=ATIVA', {
            token: 'jwt'
        });
    });

    it('deve atualizar status da candidatura', async () => {
        requisicaoApi.mockResolvedValue({ id: 'c1', status: 'PROXIMA_FASE' });

        await atualizarStatusCandidatura('c1', 'PROXIMA_FASE', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/candidaturas/c1/status', {
            method: 'PATCH',
            body: { status: 'PROXIMA_FASE' },
            token: 'jwt'
        });
    });

    it('deve listar todas as candidaturas sem filtro', async () => {
        requisicaoApi.mockResolvedValue({ candidaturas: [] });

        await listarTodasCandidaturas('jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/candidaturas', { token: 'jwt' });
    });

    it('deve listar candidaturas com filtro de vaga', async () => {
        requisicaoApi.mockResolvedValue({ candidaturas: [] });

        await listarTodasCandidaturas('jwt', { anuncioVagaId: 'v1', incluirDescartadas: true });

        expect(requisicaoApi).toHaveBeenCalledWith(
            '/recruitment/candidaturas?anuncioVagaId=v1&incluirDescartadas=true',
            { token: 'jwt' }
        );
    });

    it('deve listar candidaturas reativadas', async () => {
        requisicaoApi.mockResolvedValue({ candidaturas: [] });

        await listarTodasCandidaturas('jwt', { reativados: true });

        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/candidaturas?reativados=true', {
            token: 'jwt'
        });
    });

    it('deve reativar candidatura descartada', async () => {
        requisicaoApi.mockResolvedValue({ destino: 'CANDIDATURAS' });

        await reativarCandidatura('c1', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/candidaturas/c1/reativar', {
            method: 'POST',
            token: 'jwt'
        });
    });

    it('deve marcar visualizacao da candidatura', async () => {
        requisicaoApi.mockResolvedValue({ id: 'c1' });

        await marcarVisualizacaoCandidatura('c1', 'DESCRICAO', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/candidaturas/c1/visualizacao', {
            method: 'POST',
            body: { tipo: 'DESCRICAO' },
            token: 'jwt'
        });
    });

    it('deve gerar convite de cadastro', async () => {
        requisicaoApi.mockResolvedValue({ id: 'cad1' });

        await gerarConviteCadastro('c1', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/candidaturas/c1/convite-cadastro', {
            method: 'POST',
            token: 'jwt'
        });
    });

    it('deve listar cadastros em processo de aprovação', async () => {
        requisicaoApi.mockResolvedValue([]);

        await listarCadastrosContratacao('jwt', { processoAprovacao: true });

        expect(requisicaoApi).toHaveBeenCalledWith(
            '/recruitment/cadastros-contratacao?processoAprovacao=true',
            { token: 'jwt' }
        );
    });

    it('deve reenviar e-mail de convite', async () => {
        requisicaoApi.mockResolvedValue({ id: 'cad1' });

        await reenviarEmailConviteCadastro('cad1', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith(
            '/recruitment/cadastros-contratacao/cad1/reenviar-email',
            { method: 'POST', token: 'jwt' }
        );
    });
});
