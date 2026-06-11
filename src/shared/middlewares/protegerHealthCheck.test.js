import { jest } from '@jest/globals';

describe('protegerHealthCheck', () => {
    afterEach(() => {
        jest.resetModules();
    });

    it('deve permitir acesso em desenvolvimento sem token', async () => {
        jest.unstable_mockModule('../../config/env.js', () => ({
            default: { NODE_ENV: 'development', HEALTH_CHECK_TOKEN: 'segredo' }
        }));

        const { protegerHealthCheck } = await import('./protegerHealthCheck.js');
        const proximo = jest.fn();
        const resposta = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        protegerHealthCheck()({}, resposta, proximo);

        expect(proximo).toHaveBeenCalled();
    });

    it('deve bloquear em produção sem token válido', async () => {
        jest.unstable_mockModule('../../config/env.js', () => ({
            default: { NODE_ENV: 'production', HEALTH_CHECK_TOKEN: 'segredo-health' }
        }));

        const { protegerHealthCheck } = await import('./protegerHealthCheck.js');
        const proximo = jest.fn();
        const resposta = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        protegerHealthCheck()({ headers: {} }, resposta, proximo);

        expect(resposta.status).toHaveBeenCalledWith(401);
        expect(proximo).not.toHaveBeenCalled();
    });

    it('deve permitir em produção com X-Health-Token correto', async () => {
        jest.unstable_mockModule('../../config/env.js', () => ({
            default: { NODE_ENV: 'production', HEALTH_CHECK_TOKEN: 'segredo-health' }
        }));

        const { protegerHealthCheck } = await import('./protegerHealthCheck.js');
        const proximo = jest.fn();
        const resposta = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        protegerHealthCheck()(
            { headers: { 'x-health-token': 'segredo-health' } },
            resposta,
            proximo
        );

        expect(proximo).toHaveBeenCalled();
    });
});
