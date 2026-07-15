import { jest } from '@jest/globals';

import { verificarDisponibilidadeCaepi } from './verificarDisponibilidadeCaepi.js';

describe('verificarDisponibilidadeCaepi', () => {
    const fetchOriginal = global.fetch;

    afterEach(() => {
        global.fetch = fetchOriginal;
        jest.restoreAllMocks();
    });

    it('deve retornar true quando a API responde 200', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });

        const disponivel = await verificarDisponibilidadeCaepi('http://localhost:8080');

        expect(disponivel).toBe(true);
        expect(global.fetch).toHaveBeenCalledWith(
            'http://localhost:8080/CA/11070',
            expect.objectContaining({ signal: expect.any(AbortSignal) })
        );
    });

    it('deve retornar true quando a API responde 404 (serviço no ar)', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });

        const disponivel = await verificarDisponibilidadeCaepi('http://localhost:8080');

        expect(disponivel).toBe(true);
    });

    it('deve retornar false quando a API responde erro diferente de 404', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });

        const disponivel = await verificarDisponibilidadeCaepi('http://localhost:8080');

        expect(disponivel).toBe(false);
    });

    it('deve remover barra final da URL base', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });

        await verificarDisponibilidadeCaepi('http://localhost:8080/');

        expect(global.fetch).toHaveBeenCalledWith(
            'http://localhost:8080/CA/11070',
            expect.objectContaining({ signal: expect.any(AbortSignal) })
        );
    });

    it('deve usar URL e timeout padrão quando parâmetros não são informados', async () => {
        const fetchOriginal = global.fetch;
        global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });

        const disponivel = await verificarDisponibilidadeCaepi();

        expect(disponivel).toBe(true);
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringMatching(/\/CA\/11070$/),
            expect.objectContaining({ signal: expect.any(AbortSignal) })
        );

        global.fetch = fetchOriginal;
    });

    it('deve abortar requisição quando timeout expira', async () => {
        jest.useFakeTimers();
        global.fetch = jest.fn((_url, opcoes) =>
            new Promise((_resolve, reject) => {
                opcoes.signal.addEventListener('abort', () => {
                    reject(new Error('The operation was aborted'));
                });
            })
        );

        const promessa = verificarDisponibilidadeCaepi('http://localhost:8080', 50);
        await jest.advanceTimersByTimeAsync(60);

        await expect(promessa).resolves.toBe(false);
        jest.useRealTimers();
    });
});
