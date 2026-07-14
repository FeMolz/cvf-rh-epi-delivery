import { beforeEach, describe, expect, it, vi } from 'vitest';

import { requisicaoApi, baixarArquivoApi } from './clienteHttp.js';

const notificarSessaoExpiradaMock = vi.hoisted(() => vi.fn());

vi.mock('../auth/sessaoExpirada.js', () => ({
    notificarSessaoExpirada: notificarSessaoExpiradaMock
}));

describe('requisicaoApi', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        notificarSessaoExpiradaMock.mockReset();
    });

    it('deve enviar Authorization quando token informado', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ok: true })
        });

        vi.stubGlobal('fetch', fetchMock);

        await requisicaoApi('/users', { token: 'jwt-teste' });

        expect(fetchMock).toHaveBeenCalledWith(
            '/api/v1/users',
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer jwt-teste'
                })
            })
        );
    });

    it('deve retornar dados em requisição bem-sucedida sem token', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ lista: [1, 2] })
            })
        );

        await expect(requisicaoApi('/publico')).resolves.toEqual({ lista: [1, 2] });
    });

    it('deve enviar corpo JSON em requisições com body', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ok: true })
        });

        vi.stubGlobal('fetch', fetchMock);

        await requisicaoApi('/users', { method: 'POST', body: { nome: 'Ana' } });

        expect(fetchMock).toHaveBeenCalledWith(
            '/api/v1/users',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ nome: 'Ana' })
            })
        );
    });

    it('deve lançar erro com mensagem da API', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                json: async () => ({ error: 'Credenciais inválidas.' })
            })
        );

        await expect(
            requisicaoApi('/users/login', { method: 'POST', body: { email: 'a', password: 'b' } })
        ).rejects.toThrow('Credenciais inválidas.');
    });

    it('deve usar campo message quando error nao estiver presente', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 400,
                json: async () => ({ message: 'Dados inválidos.' })
            })
        );

        await expect(requisicaoApi('/users')).rejects.toThrow('Dados inválidos.');
    });

    it('deve usar mensagem padrão em 404', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 404,
                json: async () => ({})
            })
        );

        await expect(requisicaoApi('/recurso')).rejects.toThrow(
            'Recurso não encontrado na API. Reinicie o backend se o sistema foi atualizado recentemente.'
        );
    });

    it('deve usar mensagem genérica quando API não informa erro', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                json: async () => ({})
            })
        );

        await expect(requisicaoApi('/falha')).rejects.toThrow('Não foi possível concluir a operação.');
    });

    it('deve tolerar resposta JSON inválida', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                json: async () => {
                    throw new Error('json inválido');
                }
            })
        );

        await expect(requisicaoApi('/falha')).rejects.toThrow('Não foi possível concluir a operação.');
    });

    it('deve notificar sessão expirada em 401 com token', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                json: async () => ({ message: 'Token de autenticação inválido ou expirado.' })
            })
        );

        await expect(requisicaoApi('/employees', { token: 'jwt-expirado' })).rejects.toThrow(
            'Token de autenticação inválido ou expirado.'
        );

        expect(notificarSessaoExpiradaMock).toHaveBeenCalledTimes(1);
    });

    it('não deve notificar sessão expirada em 401 sem token', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                json: async () => ({ error: 'Credenciais inválidas.' })
            })
        );

        await expect(
            requisicaoApi('/users/login', { method: 'POST', body: { email: 'a', password: 'b' } })
        ).rejects.toThrow('Credenciais inválidas.');

        expect(notificarSessaoExpiradaMock).not.toHaveBeenCalled();
    });
});

describe('baixarArquivoApi', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        notificarSessaoExpiradaMock.mockReset();
    });

    it('deve baixar arquivo e usar nome do Content-Disposition', async () => {
        const clickMock = vi.fn();
        const link = { href: '', download: '', click: clickMock, remove: vi.fn() };
        const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(link);
        const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        const createObjectUrlMock = vi.fn(() => 'blob:url');
        const revokeObjectUrlMock = vi.fn();

        vi.stubGlobal('URL', {
            createObjectURL: createObjectUrlMock,
            revokeObjectURL: revokeObjectUrlMock
        });

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                blob: async () => new Blob(['conteudo']),
                headers: {
                    get: (nome) =>
                        nome === 'Content-Disposition' ? 'attachment; filename="relatorio.xlsx"' : null
                }
            })
        );

        await baixarArquivoApi('/relatorios/exportar', { token: 'jwt-admin' });

        expect(createObjectUrlMock).toHaveBeenCalled();
        expect(link.download).toBe('relatorio.xlsx');
        expect(clickMock).toHaveBeenCalled();
        expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:url');

        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
    });

    it('deve usar nome padrão quando Content-Disposition não informa arquivo', async () => {
        const clickMock = vi.fn();
        const link = { href: '', download: '', click: clickMock, remove: vi.fn() };
        vi.spyOn(document, 'createElement').mockReturnValue(link);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});

        vi.stubGlobal('URL', {
            createObjectURL: vi.fn(() => 'blob:url'),
            revokeObjectURL: vi.fn()
        });

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                blob: async () => new Blob(['conteudo']),
                headers: { get: () => null }
            })
        );

        await baixarArquivoApi('/relatorios/exportar', {
            token: 'jwt-admin',
            nomeArquivoPadrao: 'planilha.xlsx'
        });

        expect(link.download).toBe('planilha.xlsx');
    });

    it('deve lançar erro com mensagem da API ao falhar download', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 403,
                json: async () => ({ message: 'Sem permissão para exportar.' })
            })
        );

        await expect(baixarArquivoApi('/relatorios/exportar', { token: 'jwt' })).rejects.toThrow(
            'Sem permissão para exportar.'
        );
    });

    it('deve usar campo error ao falhar download', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 403,
                json: async () => ({ error: 'Acesso negado.' })
            })
        );

        await expect(baixarArquivoApi('/relatorios/exportar', { token: 'jwt' })).rejects.toThrow(
            'Acesso negado.'
        );
    });

    it('deve notificar sessão expirada em 401 com token no download', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                json: async () => ({ error: 'Token expirado.' })
            })
        );

        await expect(baixarArquivoApi('/relatorios/exportar', { token: 'jwt-expirado' })).rejects.toThrow(
            'Token expirado.'
        );

        expect(notificarSessaoExpiradaMock).toHaveBeenCalledTimes(1);
    });

    it('deve usar mensagem generica ao falhar download sem detalhes', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                json: async () => ({})
            })
        );

        await expect(baixarArquivoApi('/relatorios/exportar', { token: 'jwt' })).rejects.toThrow(
            'Não foi possível baixar o arquivo.'
        );
    });

    it('deve usar url base customizada quando VITE_API_URL estiver definida', async () => {
        vi.stubEnv('VITE_API_URL', 'https://api.exemplo.com/v1');
        vi.resetModules();
        notificarSessaoExpiradaMock.mockReset();

        const { requisicaoApi: requisicaoComUrlCustomizada } = await import('./clienteHttp.js');

        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ok: true })
        });

        vi.stubGlobal('fetch', fetchMock);

        await requisicaoComUrlCustomizada('/health');

        expect(fetchMock).toHaveBeenCalledWith(
            'https://api.exemplo.com/v1/health',
            expect.any(Object)
        );

        vi.unstubAllEnvs();
        vi.resetModules();
    });
});
