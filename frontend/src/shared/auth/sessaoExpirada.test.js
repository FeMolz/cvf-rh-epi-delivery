import { afterEach, describe, expect, it, vi } from 'vitest';

import {
    deveEncerrarSessaoPorResposta,
    notificarSessaoExpirada,
    registrarCallbackSessaoExpirada
} from './sessaoExpirada.js';

describe('sessaoExpirada', () => {
    afterEach(() => {
        registrarCallbackSessaoExpirada(() => {})();
    });

    it('deveEncerrarSessaoPorResposta retorna true apenas para 401 com token', () => {
        expect(deveEncerrarSessaoPorResposta(401, 'jwt')).toBe(true);
        expect(deveEncerrarSessaoPorResposta(401, undefined)).toBe(false);
        expect(deveEncerrarSessaoPorResposta(403, 'jwt')).toBe(false);
    });

    it('notificarSessaoExpirada deve chamar o callback registrado', () => {
        const callback = vi.fn();
        registrarCallbackSessaoExpirada(callback);

        notificarSessaoExpirada();

        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('notificarSessaoExpirada deve ignorar chamadas paralelas', async () => {
        const callback = vi.fn(() => {
            notificarSessaoExpirada();
        });

        registrarCallbackSessaoExpirada(callback);
        notificarSessaoExpirada();
        await Promise.resolve();

        expect(callback).toHaveBeenCalledTimes(1);
    });
});
