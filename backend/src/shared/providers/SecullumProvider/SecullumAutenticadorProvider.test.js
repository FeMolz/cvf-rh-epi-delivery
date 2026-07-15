import { jest } from '@jest/globals';

const configuracaoMock = {
    urlAutenticador: 'https://auth.test',
    urlApiIntegracao: 'https://api.test/IntegracaoExterna',
    clientId: 3,
    usuario: 'usuario@teste.com',
    senha: 'senha',
    bancoId: '10',
    timeoutMs: 5000
};

jest.unstable_mockModule('./utils/obterConfiguracaoSecullum.js', () => ({
    obterConfiguracaoSecullum: () => configuracaoMock
}));

const secullumAutenticadorProvider = (await import('./SecullumAutenticadorProvider.js')).default;

describe('SecullumAutenticadorProvider', () => {
    let fetchOriginal;

    beforeAll(() => {
        fetchOriginal = global.fetch;
    });

    afterAll(() => {
        global.fetch = fetchOriginal;
    });

    beforeEach(() => {
        secullumAutenticadorProvider.limparCacheToken();
        jest.clearAllMocks();
    });

    it('deve obter e cachear token de acesso', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                text: () =>
                    Promise.resolve(
                        JSON.stringify({
                            access_token: 'token-teste',
                            expires_in: 3600
                        })
                    )
            })
        );

        const primeiro = await secullumAutenticadorProvider.obterTokenAcesso();
        const segundo = await secullumAutenticadorProvider.obterTokenAcesso();

        expect(primeiro).toBe('token-teste');
        expect(segundo).toBe('token-teste');
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro quando autenticação falha', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                text: () => Promise.resolve('credenciais inválidas')
            })
        );

        await expect(secullumAutenticadorProvider.obterTokenAcesso()).rejects.toMatchObject({
            message: 'Falha ao autenticar na conta Secullum.',
            statusCode: 502
        });
    });

    it('deve lançar erro quando credenciais não estiverem configuradas', async () => {
        configuracaoMock.usuario = null;

        await expect(secullumAutenticadorProvider.obterTokenAcesso()).rejects.toMatchObject({
            message:
                'Credenciais Secullum não configuradas. Defina SECULLUM_USUARIO, SECULLUM_SENHA e SECULLUM_BANCO_ID.',
            statusCode: 503
        });

        configuracaoMock.usuario = 'usuario@teste.com';
    });

    it('deve lançar erro quando resposta não trouxer access_token', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({ expires_in: 3600 }))
            })
        );

        await expect(secullumAutenticadorProvider.obterTokenAcesso()).rejects.toMatchObject({
            message: 'Falha ao autenticar na conta Secullum.',
            statusCode: 502
        });
    });

    it('deve lançar erro quando fetch falhar por rede', async () => {
        global.fetch = jest.fn(() => Promise.reject(new Error('timeout')));

        await expect(secullumAutenticadorProvider.obterTokenAcesso()).rejects.toMatchObject({
            message: 'Falha ao autenticar na conta Secullum.',
            statusCode: 502
        });
    });

    it('deve usar tempo padrão de cache quando expires_in não vier na resposta', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                text: () =>
                    Promise.resolve(
                        JSON.stringify({
                            access_token: 'token-sem-expires'
                        })
                    )
            })
        );

        const token = await secullumAutenticadorProvider.obterTokenAcesso();

        expect(token).toBe('token-sem-expires');
    });

    it('deve renovar token quando cache expirar', async () => {
        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                text: () =>
                    Promise.resolve(
                        JSON.stringify({
                            access_token: 'token-1',
                            expires_in: 3600
                        })
                    )
            })
            .mockResolvedValueOnce({
                ok: true,
                text: () =>
                    Promise.resolve(
                        JSON.stringify({
                            access_token: 'token-2',
                            expires_in: 3600
                        })
                    )
            });

        await secullumAutenticadorProvider.obterTokenAcesso();
        secullumAutenticadorProvider.cacheToken.expiraEm = Date.now() - 1;

        const segundo = await secullumAutenticadorProvider.obterTokenAcesso();

        expect(segundo).toBe('token-2');
        expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('deve lançar erro quando senha não estiver configurada', async () => {
        configuracaoMock.senha = null;

        await expect(secullumAutenticadorProvider.obterTokenAcesso()).rejects.toMatchObject({
            statusCode: 503
        });

        configuracaoMock.senha = 'senha';
    });

    it('deve lançar erro quando bancoId não estiver configurado', async () => {
        configuracaoMock.bancoId = null;

        await expect(secullumAutenticadorProvider.obterTokenAcesso()).rejects.toMatchObject({
            statusCode: 503
        });

        configuracaoMock.bancoId = '10';
    });

    it('deve abortar fetch quando timeout expirar', async () => {
        jest.useFakeTimers();

        global.fetch = jest.fn(
            (_url, opcoes) =>
                new Promise((_resolve, reject) => {
                    opcoes.signal.addEventListener('abort', () => {
                        reject(new Error('Aborted'));
                    });
                })
        );

        const promessa = secullumAutenticadorProvider.obterTokenAcesso();
        const assercao = expect(promessa).rejects.toMatchObject({
            message: 'Falha ao autenticar na conta Secullum.',
            statusCode: 502
        });

        await jest.advanceTimersByTimeAsync(5000);
        await assercao;

        jest.useRealTimers();
    });
});
