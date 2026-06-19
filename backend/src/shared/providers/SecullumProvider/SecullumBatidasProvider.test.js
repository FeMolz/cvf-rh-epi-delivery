import { jest } from '@jest/globals';

const obterTokenAcessoMock = jest.fn();

jest.unstable_mockModule('./SecullumAutenticadorProvider.js', () => ({
    default: {
        obterTokenAcesso: obterTokenAcessoMock,
        limparCacheToken: jest.fn()
    }
}));

jest.unstable_mockModule('./utils/obterConfiguracaoSecullum.js', () => ({
    obterConfiguracaoSecullum: () => ({
        urlApiIntegracao: 'https://api.test/IntegracaoExterna',
        bancoId: '10',
        timeoutMs: 5000
    })
}));

const secullumBatidasProvider = (await import('./SecullumBatidasProvider.js')).default;

describe('SecullumBatidasProvider', () => {
    let fetchOriginal;

    beforeAll(() => {
        fetchOriginal = global.fetch;
    });

    afterAll(() => {
        global.fetch = fetchOriginal;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        obterTokenAcessoMock.mockResolvedValue('token-teste');
    });

    it('deve montar query com filtros obrigatórios e opcionais', () => {
        const query = secullumBatidasProvider.montarQueryBatidas({
            dataInicio: '2026-05-22',
            dataFim: '2026-05-22',
            funcionarioCpf: '12345678909'
        });

        expect(query).toContain('DataInicio=2026-05-22');
        expect(query).toContain('DataFim=2026-05-22');
        expect(query).toContain('FuncionarioCpf=12345678909');
    });

    it('deve listar batidas normalizadas', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                text: () =>
                    Promise.resolve(
                        JSON.stringify([
                            {
                                FuncionarioCpf: '123.456.789-09',
                                DataHora: '2026-05-22T08:00:00'
                            }
                        ])
                    )
            })
        );

        const batidas = await secullumBatidasProvider.listarBatidas({
            dataInicio: '2026-05-22',
            dataFim: '2026-05-22'
        });

        expect(batidas).toHaveLength(1);
        expect(batidas[0].funcionarioCpf).toBe('123.456.789-09');
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/Batidas?'),
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer token-teste',
                    secullumidbancoselecionado: '10'
                })
            })
        );
    });

    it('deve lançar erro quando API retorna falha', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 500,
                text: () => Promise.resolve('erro interno')
            })
        );

        await expect(
            secullumBatidasProvider.listarBatidas({
                dataInicio: '2026-05-22',
                dataFim: '2026-05-22'
            })
        ).rejects.toMatchObject({
            message: 'Erro ao consultar batidas no Ponto Secullum Web.',
            statusCode: 502
        });
    });
});
