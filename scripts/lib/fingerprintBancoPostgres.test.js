import { jest } from '@jest/globals';

import { calcularFingerprintBanco } from './fingerprintBancoPostgres.mjs';

describe('calcularFingerprintBanco', () => {
    it('deve produzir o mesmo hash para o mesmo estado do banco', async () => {
        const cliente = {
            query: jest
                .fn()
                .mockResolvedValueOnce({ rows: [{ tablename: 'User' }] })
                .mockResolvedValueOnce({ rows: [{ total: 2n }] })
                .mockResolvedValueOnce({ rows: [{ maximo: '2026-01-01' }] })
                .mockResolvedValueOnce({ rows: [{ tablename: 'User' }] })
                .mockResolvedValueOnce({ rows: [{ total: 2n }] })
                .mockResolvedValueOnce({ rows: [{ maximo: '2026-01-01' }] })
        };

        const primeiro = await calcularFingerprintBanco(cliente);
        const segundo = await calcularFingerprintBanco(cliente);

        expect(primeiro).toBe(segundo);
        expect(primeiro).toHaveLength(64);
    });

    it('deve alterar o hash quando a contagem muda', async () => {
        const montarCliente = (total) => ({
            query: jest
                .fn()
                .mockResolvedValueOnce({ rows: [{ tablename: 'User' }] })
                .mockResolvedValueOnce({ rows: [{ total }] })
                .mockResolvedValueOnce({ rows: [{ maximo: '' }] })
        });

        const antes = await calcularFingerprintBanco(montarCliente(1n));
        const depois = await calcularFingerprintBanco(montarCliente(2n));

        expect(antes).not.toBe(depois);
    });
});
