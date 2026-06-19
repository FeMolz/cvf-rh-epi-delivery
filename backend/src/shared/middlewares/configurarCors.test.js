import { jest } from '@jest/globals';

const corsMock = jest.fn((opcoes) => opcoes ?? 'middleware-cors-livre');

jest.unstable_mockModule('cors', () => ({
    default: corsMock
}));

describe('configurarCors', () => {
    const origemCorsAnterior = process.env.CORS_ORIGINS;

    afterEach(() => {
        if (origemCorsAnterior === undefined) {
            delete process.env.CORS_ORIGINS;
        } else {
            process.env.CORS_ORIGINS = origemCorsAnterior;
        }
        jest.clearAllMocks();
    });

    it('deve usar CORS aberto quando CORS_ORIGINS não estiver definido', async () => {
        delete process.env.CORS_ORIGINS;
        jest.resetModules();
        corsMock.mockImplementation((opcoes) => opcoes ?? 'middleware-cors-livre');

        const { configurarCors } = await import('./configurarCors.js');
        const middleware = configurarCors();

        expect(middleware).toBe('middleware-cors-livre');
        expect(corsMock).toHaveBeenCalledWith();
    });

    it('deve restringir origens quando CORS_ORIGINS listar domínios', async () => {
        process.env.CORS_ORIGINS = 'https://app.empresa.com, https://admin.empresa.com';
        jest.resetModules();
        corsMock.mockImplementation((opcoes) => opcoes);

        const { configurarCors } = await import('./configurarCors.js');
        const opcoesCors = configurarCors();

        expect(opcoesCors.credentials).toBe(true);

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
