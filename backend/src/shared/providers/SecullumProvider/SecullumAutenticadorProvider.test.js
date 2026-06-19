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
});
