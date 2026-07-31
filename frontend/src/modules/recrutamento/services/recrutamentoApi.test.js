import { describe, expect, it, vi } from 'vitest';

import {
    atualizarStatusCadastroContratacao,
    atualizarStatusCandidatura,
    atualizarStatusVaga,
    atualizarVaga,
    baixarCurriculo,
    candidatarSe,
    candidatarSePublico,
    criarVaga,
    gerarConviteCadastro,
    listarCadastrosContratacao,
    listarCandidaturas,
    listarTodasCandidaturas,
    listarVagasAdmin,
    listarVagasAtivas,
    listarVagasPublicas,
    marcarVisualizacaoCandidatura,
    obterCadastroContratacao,
    obterCadastroContratacaoPublico,
    obterVagaAdmin,
    obterVagaAtiva,
    obterVagaPublica,
    reativarCandidatura,
    reenviarEmailConviteCadastro,
    submeterCadastroContratacaoPublico
} from './recrutamentoApi.js';

vi.mock('../../../shared/api/clienteHttp.js', () => ({
    requisicaoApi: vi.fn(),
    baixarArquivoApi: vi.fn()
}));

const { requisicaoApi, baixarArquivoApi } = await import('../../../shared/api/clienteHttp.js');

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

    it('deve falhar candidatura publica com mensagem da api', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({ error: 'Currículo inválido' })
        });
        vi.stubGlobal('fetch', fetchMock);

        await expect(candidatarSePublico('v1', new FormData())).rejects.toThrow('Currículo inválido');
        vi.unstubAllGlobals();
    });

    it('deve falhar candidatura autenticada com message da api', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({ message: 'Já candidatou' })
        });
        vi.stubGlobal('fetch', fetchMock);

        await expect(candidatarSe('v1', new FormData(), 'jwt')).rejects.toThrow('Já candidatou');
        vi.unstubAllGlobals();
    });

    it('deve candidatar-se autenticado com sucesso', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ id: 'c1' })
        });
        vi.stubGlobal('fetch', fetchMock);

        await expect(candidatarSe('v1', new FormData(), 'jwt')).resolves.toEqual({ id: 'c1' });
        vi.unstubAllGlobals();
    });

    it('deve usar mensagem padrao quando resposta de erro nao tiver texto', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => {
                throw new Error('invalid json');
            }
        });
        vi.stubGlobal('fetch', fetchMock);

        await expect(candidatarSePublico('v1', new FormData())).rejects.toThrow(
            /não foi possível enviar a candidatura/i
        );
        vi.unstubAllGlobals();
    });

    it('deve listar vagas admin sem filtro', async () => {
        requisicaoApi.mockResolvedValue([]);
        await listarVagasAdmin('jwt');
        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/vagas', { token: 'jwt' });
    });

    it('deve obter, criar, atualizar e alterar status de vaga admin', async () => {
        requisicaoApi.mockResolvedValue({ id: 'v1' });

        await obterVagaAdmin('v1', 'jwt');
        await criarVaga({ tituloVaga: 'X' }, 'jwt');
        await atualizarVaga('v1', { tituloVaga: 'Y' }, 'jwt');
        await atualizarStatusVaga('v1', 'ATIVA', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/vagas/v1', { token: 'jwt' });
        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/vagas', {
            method: 'POST',
            body: { tituloVaga: 'X' },
            token: 'jwt'
        });
        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/vagas/v1', {
            method: 'PUT',
            body: { tituloVaga: 'Y' },
            token: 'jwt'
        });
        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/vagas/v1/status', {
            method: 'PATCH',
            body: { status: 'ATIVA' },
            token: 'jwt'
        });
    });

    it('deve listar candidaturas por vaga com e sem filtros', async () => {
        requisicaoApi.mockResolvedValue([]);

        await listarCandidaturas('v1', 'jwt');
        await listarCandidaturas('v1', 'jwt', { status: 'NOVA', incluirDescartadas: true });

        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/vagas/v1/candidaturas', {
            token: 'jwt'
        });
        expect(requisicaoApi).toHaveBeenCalledWith(
            '/recruitment/vagas/v1/candidaturas?status=NOVA&incluirDescartadas=true',
            { token: 'jwt' }
        );
    });

    it('deve listar candidaturas com ordenacao e periodo', async () => {
        requisicaoApi.mockResolvedValue({ candidaturas: [] });

        await listarTodasCandidaturas('jwt', {
            status: 'NOVA',
            dataInicio: '2026-01-01',
            dataFim: '2026-01-31',
            ordenacao: 'ANTIGOS'
        });

        expect(requisicaoApi).toHaveBeenCalledWith(
            '/recruitment/candidaturas?status=NOVA&dataInicio=2026-01-01&dataFim=2026-01-31&ordenacao=ANTIGOS',
            { token: 'jwt' }
        );
    });

    it('deve operar cadastros de contratacao e curriculo', async () => {
        requisicaoApi.mockResolvedValue({ id: 'cad1' });
        baixarArquivoApi.mockResolvedValue(undefined);

        await listarCadastrosContratacao('jwt');
        await listarCadastrosContratacao('jwt', { status: 'AGUARDANDO_ANALISE_RH' });
        await obterCadastroContratacao('cad1', 'jwt');
        await atualizarStatusCadastroContratacao('cad1', { status: 'CONTRATADO' }, 'jwt');
        await obterCadastroContratacaoPublico('tok');
        await submeterCadastroContratacaoPublico('tok', { name: 'Maria' });
        await baixarCurriculo('c1', 'jwt');

        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/cadastros-contratacao', {
            token: 'jwt'
        });
        expect(requisicaoApi).toHaveBeenCalledWith(
            '/recruitment/cadastros-contratacao?status=AGUARDANDO_ANALISE_RH',
            { token: 'jwt' }
        );
        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/cadastros-contratacao/cad1', {
            token: 'jwt'
        });
        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/cadastros-contratacao/cad1/status', {
            method: 'PATCH',
            body: { status: 'CONTRATADO' },
            token: 'jwt'
        });
        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/publico/cadastro-contratacao/tok');
        expect(requisicaoApi).toHaveBeenCalledWith('/recruitment/publico/cadastro-contratacao/tok', {
            method: 'POST',
            body: { name: 'Maria' }
        });
        expect(baixarArquivoApi).toHaveBeenCalledWith('/recruitment/candidaturas/c1/curriculo', {
            token: 'jwt',
            nomeArquivoPadrao: 'curriculo.pdf'
        });
    });

    it('deve falhar candidatura publica usando message quando nao houver error', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({ message: 'Vaga encerrada' })
        });
        vi.stubGlobal('fetch', fetchMock);

        await expect(candidatarSePublico('v1', new FormData())).rejects.toThrow('Vaga encerrada');
        vi.unstubAllGlobals();
    });

    it('deve falhar candidatura autenticada usando error quando disponivel', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({ error: 'Vaga inativa' })
        });
        vi.stubGlobal('fetch', fetchMock);

        await expect(candidatarSe('v1', new FormData(), 'jwt')).rejects.toThrow('Vaga inativa');
        vi.unstubAllGlobals();
    });

    it('deve usar mensagem padrao na candidatura autenticada quando resposta nao tiver texto', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => {
                throw new Error('invalid json');
            }
        });
        vi.stubGlobal('fetch', fetchMock);

        await expect(candidatarSe('v1', new FormData(), 'jwt')).rejects.toThrow(
            /não foi possível enviar a candidatura/i
        );
        vi.unstubAllGlobals();
    });

    it('deve usar url base customizada quando VITE_API_URL estiver definida', async () => {
        vi.stubEnv('VITE_API_URL', 'https://api.exemplo.com/v1');
        vi.resetModules();

        const { candidatarSePublico: candidatarComUrlCustomizada } = await import(
            './recrutamentoApi.js'
        );

        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ id: 'c1' })
        });
        vi.stubGlobal('fetch', fetchMock);

        await candidatarComUrlCustomizada('v1', new FormData());

        expect(fetchMock).toHaveBeenCalledWith(
            'https://api.exemplo.com/v1/recruitment/publico/vagas/v1/candidaturas',
            expect.any(Object)
        );

        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
        vi.resetModules();
    });
});
