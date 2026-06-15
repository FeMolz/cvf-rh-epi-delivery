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

    it('deve retornar false quando a conexão falha', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

        const disponivel = await verificarDisponibilidadeCaepi('http://localhost:8080');

        expect(disponivel).toBe(false);
    });
});
