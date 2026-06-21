import { jest } from '@jest/globals';
import epiProvider from './EpiProvider.js';

describe('EpiProvider', () => {
    let originalFetch;

    beforeAll(() => {
        originalFetch = global.fetch;
    });

    afterAll(() => {
        global.fetch = originalFetch;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return null when API returns 404', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 404,
            })
        );

        const result = await epiProvider.getEpiByCa('99999');
        expect(result).toBeNull();
    });

    it('should throw error when API returns other error', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            })
        );

        await expect(epiProvider.getEpiByCa('123')).rejects.toThrow('Erro interno ao tentar consultar o EPI.');
    });

    it('should return mapped EPI data on success', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    RegistroCA: '11070',
                    NomeEquipamento: 'Capacete de Segurança',
                    DataValidade: '25/12/2025',
                    Situacao: 'VÁLIDO'
                })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');
        expect(result).toEqual({
            caNumber: '11070',
            name: 'Capacete de Segurança',
            expirationDate: new Date('2025-12-25T00:00:00Z'),
            isActive: true,
            hasValidCaRegistration: true,
            rawData: expect.any(Object)
        });
    });

    it('should mark CA as invalid when Validade is false', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    RegistroCA: '11070',
                    NomeEquipamento: 'Capacete de Segurança',
                    DataValidade: '25/12/2025',
                    Situacao: 'VÁLIDO',
                    Validade: false
                })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');
        expect(result.hasValidCaRegistration).toBe(false);
        expect(result.isActive).toBe(false);
    });

    it('should mark CA as invalid when StatusValidade is false', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    RegistroCA: '11070',
                    NomeEquipamento: 'Capacete de Segurança',
                    DataValidade: '25/12/2025',
                    Situacao: 'VÁLIDO',
                    StatusValidade: false
                })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');
        expect(result.hasValidCaRegistration).toBe(false);
        expect(result.isActive).toBe(false);
    });

    it('should mark CA as invalid when Situacao indicates cancellation', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    RegistroCA: '11070',
                    NomeEquipamento: 'Capacete de Segurança',
                    DataValidade: '25/12/2025',
                    Situacao: 'CANCELADO'
                })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');
        expect(result.hasValidCaRegistration).toBe(false);
        expect(result.isActive).toBe(false);
    });

    it('should return epis when searching by equipment name', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve([
                        { caNumber: '11070', name: 'Capacete de Segurança' }
                    ])
            })
        );

        const result = await epiProvider.buscarEpisPorNomeEquipamento('capacete');

        expect(result).toEqual([{ caNumber: '11070', name: 'Capacete de Segurança' }]);
    });
});
