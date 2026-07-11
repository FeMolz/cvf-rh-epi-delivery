import { jest } from '@jest/globals';

const corsMock = jest.fn((opcoes) => opcoes ?? 'middleware-cors-livre');

jest.unstable_mockModule('cors', () => ({
    default: corsMock
}));

describe('configurarCors', () => {
    const origemCorsAnterior = process.env.CORS_ORIGINS;
    const nodeEnvAnterior = process.env.NODE_ENV;

    afterEach(() => {
        if (origemCorsAnterior === undefined) {
            delete process.env.CORS_ORIGINS;
        } else {
            process.env.CORS_ORIGINS = origemCorsAnterior;
        }

        if (nodeEnvAnterior === undefined) {
            delete process.env.NODE_ENV;
        } else {
            process.env.NODE_ENV = nodeEnvAnterior;
        }

        jest.clearAllMocks();
        jest.resetModules();
    });

    async function importarConfigurarCors(envMock) {
        jest.resetModules();
        corsMock.mockImplementation((opcoes) => opcoes ?? 'middleware-cors-livre');

        jest.unstable_mockModule('../../config/env.js', () => ({
            default: envMock
        }));

        return import('./configurarCors.js');
    }

    it('deve usar CORS aberto quando CORS_ORIGINS não estiver definido', async () => {
        const { configurarCors } = await importarConfigurarCors({
            NODE_ENV: 'development',
            CORS_ORIGINS: undefined
        });
        const middleware = configurarCors();

        expect(middleware).toBe('middleware-cors-livre');
        expect(corsMock).toHaveBeenCalledWith();
    });

    it('deve bloquear CORS em produção quando origens não estiverem configuradas', async () => {
        corsMock.mockImplementation((opcoes) => opcoes);

        const { configurarCors } = await importarConfigurarCors({
            NODE_ENV: 'production',
            CORS_ORIGINS: undefined
        });
        const opcoesCors = configurarCors();

        expect(opcoesCors.origin).toBe(false);
    });

    it('deve bloquear CORS em produção quando CORS_ORIGINS for asterisco', async () => {
        corsMock.mockImplementation((opcoes) => opcoes);

        const { configurarCors } = await importarConfigurarCors({
            NODE_ENV: 'production',
            CORS_ORIGINS: '*'
        });
        const opcoesCors = configurarCors();

        expect(opcoesCors.origin).toBe(false);
    });

    it('deve restringir origens quando CORS_ORIGINS listar domínios', async () => {
        corsMock.mockImplementation((opcoes) => opcoes);

        const { configurarCors } = await importarConfigurarCors({
            NODE_ENV: 'development',
            CORS_ORIGINS: 'https://app.empresa.com, https://admin.empresa.com'
        });
        const opcoesCors = configurarCors();

        expect(opcoesCors.credentials).toBe(true);

        const callbackSemOrigem = jest.fn();
        opcoesCors.origin(undefined, callbackSemOrigem);
        expect(callbackSemOrigem).toHaveBeenCalledWith(null, true);

        const callbackPermitido = jest.fn();
        opcoesCors.origin('https://app.empresa.com', callbackPermitido);
        expect(callbackPermitido).toHaveBeenCalledWith(null, true);

        const callbackBloqueado = jest.fn();
        opcoesCors.origin('https://malicioso.com', callbackBloqueado);
        expect(callbackBloqueado).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Origem não permitida pelo CORS' })
        );
    });
});
