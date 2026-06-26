import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
    notificarSessaoExpirada,
    registrarAoSessaoExpirada,
    reiniciarNotificacaoSessaoExpirada
} from './sessaoExpirada.js';

describe('sessaoExpirada', () => {
    beforeEach(() => {
        reiniciarNotificacaoSessaoExpirada();
        registrarAoSessaoExpirada(() => undefined);
    });

    it('deve notificar callback apenas uma vez', () => {
        const callback = vi.fn();
        registrarAoSessaoExpirada(callback);

        notificarSessaoExpirada();
        notificarSessaoExpirada();

        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('deve permitir nova notificação após reiniciar', () => {
        const callback = vi.fn();
        registrarAoSessaoExpirada(callback);

        notificarSessaoExpirada();
        reiniciarNotificacaoSessaoExpirada();
        notificarSessaoExpirada();

        expect(callback).toHaveBeenCalledTimes(2);
    });
});
