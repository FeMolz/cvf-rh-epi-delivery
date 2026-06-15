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
});
