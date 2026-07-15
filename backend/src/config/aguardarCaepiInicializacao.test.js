import { jest } from '@jest/globals';

jest.unstable_mockModule('../shared/providers/EpiProvider/verificarDisponibilidadeCaepi.js', () => ({
    verificarDisponibilidadeCaepi: jest.fn()
}));

const { aguardarCaepiDisponivel } = await import('./aguardarCaepiInicializacao.js');
const { verificarDisponibilidadeCaepi } = await import(
    '../shared/providers/EpiProvider/verificarDisponibilidadeCaepi.js'
);

describe('aguardarCaepiDisponivel', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('deve resolver quando a API ficar disponível na primeira tentativa', async () => {
        verificarDisponibilidadeCaepi.mockResolvedValue(true);

        await expect(aguardarCaepiDisponivel('http://localhost:8080')).resolves.toBeUndefined();
        expect(verificarDisponibilidadeCaepi).toHaveBeenCalledTimes(1);
    });

    it('deve falhar após esgotar tentativas', async () => {
        verificarDisponibilidadeCaepi.mockResolvedValue(false);

        const promessa = aguardarCaepiDisponivel('http://localhost:8080');
        const assertao = expect(promessa).rejects.toThrow('API baseCAEPI indisponível');

        await jest.runAllTimersAsync();
        await assertao;
    });

    it('deve resolver na segunda tentativa após aguardar intervalo', async () => {
        verificarDisponibilidadeCaepi
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(true);

        const promessa = aguardarCaepiDisponivel('http://localhost:8080');
        await jest.runAllTimersAsync();
        await expect(promessa).resolves.toBeUndefined();

        expect(verificarDisponibilidadeCaepi).toHaveBeenCalledTimes(2);
    });

    it('deve ignorar espera quando aguardarInicio é false', async () => {
        const { aguardarCaepiSeNecessario } = await import('./aguardarCaepiInicializacao.js');

        await expect(
            aguardarCaepiSeNecessario({
                nodeEnv: 'production',
                urlCaepi: 'http://localhost:8080',
                aguardarInicio: false
            })
        ).resolves.toBeUndefined();

        expect(verificarDisponibilidadeCaepi).not.toHaveBeenCalled();
    });

    it('deve aguardar CAEPI quando aguardarInicio for true em desenvolvimento', async () => {
        const { aguardarCaepiSeNecessario } = await import('./aguardarCaepiInicializacao.js');
        verificarDisponibilidadeCaepi.mockResolvedValue(true);

        await expect(
            aguardarCaepiSeNecessario({
                nodeEnv: 'development',
                urlCaepi: null,
                aguardarInicio: true
            })
        ).resolves.toBeUndefined();

        expect(verificarDisponibilidadeCaepi).toHaveBeenCalled();
    });

    it('deve ignorar espera em produção sem URL configurada', async () => {
        const { aguardarCaepiSeNecessario } = await import('./aguardarCaepiInicializacao.js');

        await expect(
            aguardarCaepiSeNecessario({
                nodeEnv: 'production',
                urlCaepi: null,
                aguardarInicio: true
            })
        ).resolves.toBeUndefined();

        expect(verificarDisponibilidadeCaepi).not.toHaveBeenCalled();
    });

    it('deve usar CAEPI_API_URL do ambiente quando url não for informada', async () => {
        process.env.CAEPI_API_URL = 'http://localhost:9090';
        verificarDisponibilidadeCaepi.mockResolvedValue(true);

        await expect(aguardarCaepiDisponivel()).resolves.toBeUndefined();

        expect(verificarDisponibilidadeCaepi).toHaveBeenCalledWith('http://localhost:9090');
    });

    it('deve usar URL padrão quando url e variável de ambiente estiverem ausentes', async () => {
        delete process.env.CAEPI_API_URL;
        verificarDisponibilidadeCaepi.mockResolvedValue(true);

        await expect(aguardarCaepiDisponivel(null)).resolves.toBeUndefined();

        expect(verificarDisponibilidadeCaepi).toHaveBeenCalledWith('http://localhost:8080');
    });
});
