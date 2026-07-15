import { jest } from '@jest/globals';

const obterTokenAcessoMock = jest.fn();
const limparCacheTokenMock = jest.fn();

jest.unstable_mockModule('./SecullumAutenticadorProvider.js', () => ({
    default: {
        obterTokenAcesso: obterTokenAcessoMock,
        limparCacheToken: limparCacheTokenMock
    }
}));

const configuracaoBatidasMock = {
    urlApiIntegracao: 'https://api.test/IntegracaoExterna',
    bancoId: '10',
    timeoutMs: 5000
};

jest.unstable_mockModule('./utils/obterConfiguracaoSecullum.js', () => ({
    obterConfiguracaoSecullum: () => configuracaoBatidasMock
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
        configuracaoBatidasMock.urlApiIntegracao = 'https://api.test/IntegracaoExterna';
    });

    it('deve montar query apenas com filtros obrigatórios', () => {
        const query = secullumBatidasProvider.montarQueryBatidas({
            dataInicio: '2026-05-22',
            dataFim: '2026-05-22'
        });

        expect(query).toBe('DataInicio=2026-05-22&DataFim=2026-05-22');
    });

    it('deve montar query com filtros obrigatórios e opcionais', () => {
        const query = secullumBatidasProvider.montarQueryBatidas({
            dataInicio: '2026-05-22',
            dataFim: '2026-05-22',
            funcionarioCpf: '12345678909',
            funcionarioPis: '12345678901',
            empresaDocumento: '11222333000181',
            horaInicio: '08:00',
            horaFim: '18:00'
        });

        expect(query).toContain('DataInicio=2026-05-22');
        expect(query).toContain('DataFim=2026-05-22');
        expect(query).toContain('FuncionarioCpf=12345678909');
        expect(query).toContain('FuncionarioPis=12345678901');
        expect(query).toContain('EmpresaDocumento=11222333000181');
        expect(query).toContain('HoraInicio=08%3A00');
        expect(query).toContain('HoraFim=18%3A00');
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

    it('deve retornar lista vazia quando API responder sem conteúdo', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                text: () => Promise.resolve('')
            })
        );

        const batidas = await secullumBatidasProvider.listarBatidas({
            dataInicio: '2026-05-22',
            dataFim: '2026-05-22'
        });

        expect(batidas).toEqual([]);
    });

    it('deve limpar cache e lançar erro quando API retornar 401', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 401,
                text: () => Promise.resolve('não autorizado')
            })
        );

        await expect(
            secullumBatidasProvider.listarBatidas({
                dataInicio: '2026-05-22',
                dataFim: '2026-05-22'
            })
        ).rejects.toMatchObject({
            message: 'Banco Ponto Web não autorizado para esta conta Secullum.',
            statusCode: 502
        });

        expect(limparCacheTokenMock).toHaveBeenCalled();
    });

    it('deve lançar erro quando fetch falhar por rede', async () => {
        global.fetch = jest.fn(() => Promise.reject(new Error('rede indisponível')));

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

    it('deve remover barra final da url de integração', async () => {
        configuracaoBatidasMock.urlApiIntegracao = 'https://api.test/IntegracaoExterna/';

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                text: () => Promise.resolve('[]')
            })
        );

        await secullumBatidasProvider.listarBatidas({
            dataInicio: '2026-05-22',
            dataFim: '2026-05-22'
        });

        expect(global.fetch).toHaveBeenCalledWith(
            'https://api.test/IntegracaoExterna/Batidas?DataInicio=2026-05-22&DataFim=2026-05-22',
            expect.any(Object)
        );
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

        const promessa = secullumBatidasProvider.listarBatidas({
            dataInicio: '2026-05-22',
            dataFim: '2026-05-22'
        });
        const assercao = expect(promessa).rejects.toMatchObject({
            message: 'Erro ao consultar batidas no Ponto Secullum Web.',
            statusCode: 502
        });

        await jest.advanceTimersByTimeAsync(5000);
        await assercao;

        jest.useRealTimers();
    });
});
