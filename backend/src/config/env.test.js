import { jest } from '@jest/globals';

import {
    DIAS_VALIDADE_TOKEN_CADASTRO_PADRAO,
    LIMITE_REQUISICOES_GLOBAL_PADRAO
} from '../shared/constants/segurancaConstantes.js';
import { URL_PADRAO_CAEPI_API } from '../shared/constants/caepiConstantes.js';

jest.unstable_mockModule('./validarConfiguracaoAmbiente.js', () => ({
    validarSegredoJwt: jest.fn(),
    validarOrigensCorsProducao: jest.fn(),
    validarRedisProducao: jest.fn(),
    validarCaepiProducao: jest.fn()
}));

describe('env', () => {
    const envAnterior = { ...process.env };

    afterEach(() => {
        process.env = { ...envAnterior };
        jest.resetModules();
    });

    async function importarEnv() {
        return (await import('./env.js')).default;
    }

    it('deve expor valores padrão em ambiente de teste', async () => {
        process.env.NODE_ENV = 'test';
        process.env.DATABASE_URL = 'postgresql://localhost/teste';
        process.env.JWT_SECRET = 'segredo-teste-local-16';
        delete process.env.PORT;
        delete process.env.CAEPI_AGUARDAR_INICIO;

        const env = await importarEnv();

        expect(env.PORT).toBe(3000);
        expect(env.NODE_ENV).toBe('test');
        expect(env.JWT_EXPIRES_IN).toBe('1d');
        expect(env.TOKEN_CADASTRO_VALIDADE_DIAS).toBe(DIAS_VALIDADE_TOKEN_CADASTRO_PADRAO);
        expect(env.RATE_LIMIT_GLOBAL_MAX).toBe(LIMITE_REQUISICOES_GLOBAL_PADRAO);
        expect(env.RATE_LIMIT_LOGIN_MAX).toBe(20);
        expect(env.RATE_LIMIT_PUBLICO_MAX).toBe(60);
        expect(env.REDIS_URL).toBeNull();
        expect(env.HEALTH_CHECK_TOKEN).toBeNull();
        expect(env.CAEPI_API_URL).toBe(URL_PADRAO_CAEPI_API);
        expect(env.CAEPI_AGUARDAR_INICIO).toBe(false);
        expect(env.CAEPI_USAR_SOMENTE_CACHE).toBe(false);
    });

    it('deve lançar erro quando DATABASE_URL não estiver definida', async () => {
        jest.resetModules();
        jest.unstable_mockModule('dotenv/config', () => ({}));
        jest.unstable_mockModule('./validarConfiguracaoAmbiente.js', () => ({
            validarSegredoJwt: jest.fn(),
            validarOrigensCorsProducao: jest.fn(),
            validarRedisProducao: jest.fn(),
            validarCaepiProducao: jest.fn()
        }));

        process.env.NODE_ENV = 'test';
        delete process.env.DATABASE_URL;

        await expect(importarEnv()).rejects.toThrow(
            'DATABASE_URL is not defined in environment variables'
        );
    });

    it('deve resolver CAEPI_AGUARDAR_INICIO como false para valores explícitos falsos', async () => {
        process.env.NODE_ENV = 'production';
        process.env.DATABASE_URL = 'postgresql://localhost/teste';
        process.env.JWT_SECRET = 'segredo-teste-local-16';

        process.env.CAEPI_AGUARDAR_INICIO = 'false';
        expect((await importarEnv()).CAEPI_AGUARDAR_INICIO).toBe(false);

        jest.resetModules();
        process.env.CAEPI_AGUARDAR_INICIO = '0';
        expect((await importarEnv()).CAEPI_AGUARDAR_INICIO).toBe(false);
    });

    it('deve resolver CAEPI_AGUARDAR_INICIO como true para valores explícitos verdadeiros', async () => {
        process.env.NODE_ENV = 'test';
        process.env.DATABASE_URL = 'postgresql://localhost/teste';
        process.env.JWT_SECRET = 'segredo-teste-local-16';

        process.env.CAEPI_AGUARDAR_INICIO = 'true';
        expect((await importarEnv()).CAEPI_AGUARDAR_INICIO).toBe(true);

        jest.resetModules();
        process.env.CAEPI_AGUARDAR_INICIO = '1';
        expect((await importarEnv()).CAEPI_AGUARDAR_INICIO).toBe(true);
    });

    it('deve aguardar CAEPI em produção quando valor explícito não for informado', async () => {
        process.env.NODE_ENV = 'production';
        process.env.DATABASE_URL = 'postgresql://localhost/teste';
        process.env.JWT_SECRET = 'segredo-teste-local-16';
        delete process.env.CAEPI_AGUARDAR_INICIO;

        const env = await importarEnv();

        expect(env.CAEPI_AGUARDAR_INICIO).toBe(true);
    });

    it('deve usar development como NODE_ENV padrão', async () => {
        delete process.env.NODE_ENV;
        process.env.DATABASE_URL = 'postgresql://localhost/teste';
        process.env.JWT_SECRET = 'segredo-teste-local-16';

        const env = await importarEnv();

        expect(env.NODE_ENV).toBe('development');
        expect(env.CAEPI_AGUARDAR_INICIO).toBe(false);
    });

    it('deve honrar variáveis opcionais quando informadas', async () => {
        process.env.NODE_ENV = 'test';
        process.env.DATABASE_URL = 'postgresql://localhost/teste';
        process.env.JWT_SECRET = 'segredo-teste-local-16';
        process.env.PORT = '4000';
        process.env.REDIS_URL = 'redis://localhost:6379';
        process.env.HEALTH_CHECK_TOKEN = 'token-health';
        process.env.CAEPI_USAR_SOMENTE_CACHE = 'true';

        const env = await importarEnv();

        expect(env.PORT).toBe(4000);
        expect(env.REDIS_URL).toBe('redis://localhost:6379');
        expect(env.HEALTH_CHECK_TOKEN).toBe('token-health');
        expect(env.CAEPI_USAR_SOMENTE_CACHE).toBe(true);
    });
});
