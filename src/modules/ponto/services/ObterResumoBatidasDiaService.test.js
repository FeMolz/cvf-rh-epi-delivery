import { jest } from '@jest/globals';

const funcionarioPontoRepositoryMock = {
    listarAtivos: jest.fn()
};

const secullumBatidasProviderMock = {
    listarBatidas: jest.fn()
};

jest.unstable_mockModule('../repositories/FuncionarioPontoRepository.js', () => ({
    default: funcionarioPontoRepositoryMock
}));

jest.unstable_mockModule(
    '../../../shared/providers/SecullumProvider/SecullumBatidasProvider.js',
    () => ({
        default: secullumBatidasProviderMock
    })
);

const obterResumoBatidasDiaService = (await import('./ObterResumoBatidasDiaService.js')).default;

describe('ObterResumoBatidasDiaService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve lançar erro para data inválida', async () => {
        await expect(
            obterResumoBatidasDiaService.execute({ dataReferencia: 'data-invalida' })
        ).rejects.toThrow('Parâmetro data inválido');
    });

    it('deve retornar resumo com totais e listas', async () => {
        funcionarioPontoRepositoryMock.listarAtivos.mockResolvedValue([
            { id: '1', name: 'Ana', cpf: '123.456.789-09', pis: null },
            { id: '2', name: 'Bruno', cpf: '987.654.321-00', pis: null }
        ]);

        secullumBatidasProviderMock.listarBatidas.mockResolvedValue([
            {
                funcionarioCpf: '123.456.789-09',
                funcionarioPis: null,
                dataHora: '2026-05-22T08:00:00',
                origem: null,
                dadosBrutos: { id: 1 }
            }
        ]);

        const resultado = await obterResumoBatidasDiaService.execute({
            dataReferencia: '2026-05-22'
        });

        expect(resultado.dataReferencia).toBe('2026-05-22');
        expect(resultado.totais).toEqual({
            ativos: 2,
            comBatida: 1,
            semBatida: 1
        });
        expect(secullumBatidasProviderMock.listarBatidas).toHaveBeenCalledWith({
            dataInicio: '2026-05-22',
            dataFim: '2026-05-22'
        });
    });
});
