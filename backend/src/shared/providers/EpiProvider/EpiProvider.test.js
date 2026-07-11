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

    it('should throw when search endpoint is missing on the CAEPI API', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ detail: 'Not Found' })
            })
        );

        await expect(epiProvider.buscarEpisPorNomeEquipamento('capacete')).rejects.toThrow(
            'Busca por nome indisponível na API CAEPI'
        );
    });

    it('should return empty array when search term is blank', async () => {
        global.fetch = jest.fn();

        const result = await epiProvider.buscarEpisPorNomeEquipamento('   ');

        expect(result).toEqual([]);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return empty array on 404 without detail Not Found', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ message: 'não encontrado' })
            })
        );

        const result = await epiProvider.buscarEpisPorNomeEquipamento('luva');

        expect(result).toEqual([]);
    });

    it('should return empty array when API response is not an array', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ caNumber: '1' })
            })
        );

        const result = await epiProvider.buscarEpisPorNomeEquipamento('luva');

        expect(result).toEqual([]);
    });

    it('should map RegistroCA and NomeEquipamento fields on search', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve([
                        { RegistroCA: '22001', NomeEquipamento: 'Luva de Proteção' },
                        { caNumber: '', name: 'Sem CA' }
                    ])
            })
        );

        const result = await epiProvider.buscarEpisPorNomeEquipamento('luva');

        expect(result).toEqual([{ caNumber: '22001', name: 'Luva de Proteção' }]);
    });

    it('should throw CAEPI unavailable when fetch fails on search', async () => {
        const erroRede = new Error('fetch failed');
        erroRede.cause = { code: 'ECONNREFUSED' };
        global.fetch = jest.fn(() => Promise.reject(erroRede));

        await expect(epiProvider.buscarEpisPorNomeEquipamento('capacete')).rejects.toThrow(
            'API CAEPI indisponível'
        );
    });

    it('should throw internal error on unexpected search failure', async () => {
        global.fetch = jest.fn(() => Promise.reject(new Error('erro inesperado')));

        await expect(epiProvider.buscarEpisPorNomeEquipamento('capacete')).rejects.toThrow(
            'Erro interno ao tentar consultar o EPI.'
        );
    });

    it('should throw when search API returns non-ok status', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            })
        );

        await expect(epiProvider.buscarEpisPorNomeEquipamento('capacete')).rejects.toThrow(
            'Erro interno ao tentar consultar o EPI.'
        );
    });

    it('should use ISO date when DataValidade is not in dd/mm/yyyy format', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '2025-12-25',
                        Situacao: 'VÁLIDO'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.expirationDate).toEqual(new Date('2025-12-25'));
    });

    it('should default expirationDate to now when DataValidade is absent', async () => {
        const antes = Date.now();
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        Situacao: 'VÁLIDO'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');
        const depois = Date.now();

        expect(result.expirationDate.getTime()).toBeGreaterThanOrEqual(antes);
        expect(result.expirationDate.getTime()).toBeLessThanOrEqual(depois);
    });

    it('should mark CA as invalid for suspended registration status', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025',
                        Situacao: 'SUSPENSO'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.hasValidCaRegistration).toBe(false);
    });

    it('should mark CA as valid when Validade string is SIM', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025',
                        Validade: 'SIM'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.hasValidCaRegistration).toBe(true);
    });

    it('should throw internal error when fetch fails on getEpiByCa', async () => {
        global.fetch = jest.fn(() => Promise.reject(new Error('rede indisponível')));

        await expect(epiProvider.getEpiByCa('11070')).rejects.toThrow(
            'Erro interno ao tentar consultar o EPI.'
        );
    });

    it('should mark CA as valid when Validade numeric indicator is one', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025',
                        Validade: 1
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.hasValidCaRegistration).toBe(true);
    });

    it('should mark CA as invalid when Validade numeric indicator is zero', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025',
                        Validade: 0
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.hasValidCaRegistration).toBe(false);
    });

    it('should mark CA as invalid when Validade string is NAO', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025',
                        Validade: 'NAO'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.hasValidCaRegistration).toBe(false);
    });

    it('should return empty array when 404 body is not valid JSON', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 404,
                json: () => Promise.reject(new Error('json inválido'))
            })
        );

        const result = await epiProvider.buscarEpisPorNomeEquipamento('luva');

        expect(result).toEqual([]);
    });

    it('should throw internal error when search failure is not Error instance', async () => {
        global.fetch = jest.fn(() => Promise.reject('falha textual'));

        await expect(epiProvider.buscarEpisPorNomeEquipamento('capacete')).rejects.toThrow(
            'Erro interno ao tentar consultar o EPI.'
        );
    });

    it('should map search results using NomeEquipamento fallback', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([{ RegistroCA: '22002' }])
            })
        );

        const result = await epiProvider.buscarEpisPorNomeEquipamento('luva');

        expect(result).toEqual([{ caNumber: '22002', name: 'EPI Sem Nome' }]);
    });

    it('should treat non-string situacao as valid registration', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025',
                        Situacao: null,
                        Validade: 'FALSO'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.hasValidCaRegistration).toBe(false);
    });

    it('should mark CA as valid when Validade string is VERDADEIRO', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025',
                        Validade: 'VERDADEIRO'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.hasValidCaRegistration).toBe(true);
    });

    it('should use input caNumber when RegistroCA is absent in response', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('99999');

        expect(result.caNumber).toBe('99999');
        expect(result.name).toBe('Capacete');
    });

    it('should use default name when NomeEquipamento is absent', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        DataValidade: '25/12/2025'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.name).toBe('EPI Sem Nome');
    });

    it('should mark CA as invalid for expired registration status', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025',
                        Situacao: 'VENCIDO'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.hasValidCaRegistration).toBe(false);
    });

    it('should throw CAEPI unavailable when ENOTFOUND occurs on search', async () => {
        const erroRede = new Error('getaddrinfo ENOTFOUND');
        erroRede.cause = { code: 'ENOTFOUND' };
        global.fetch = jest.fn(() => Promise.reject(erroRede));

        await expect(epiProvider.buscarEpisPorNomeEquipamento('capacete')).rejects.toThrow(
            'API CAEPI indisponível'
        );
    });

    it('should mark CA as valid when Validade string is S', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025',
                        Validade: 'S'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.hasValidCaRegistration).toBe(true);
    });

    it('should mark CA as invalid when StatusValidade string is N', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025',
                        StatusValidade: 'N'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.hasValidCaRegistration).toBe(false);
    });

    it('should mark CA as invalid for cassado registration status', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025',
                        Situacao: 'CASSADO'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.hasValidCaRegistration).toBe(false);
    });

    it('should mark CA as invalid for invalido registration status with accent', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025',
                        Situacao: 'INVÁLIDO'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.hasValidCaRegistration).toBe(false);
    });

    it('should return empty array when search term is null', async () => {
        global.fetch = jest.fn();

        const result = await epiProvider.buscarEpisPorNomeEquipamento(null);

        expect(result).toEqual([]);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should mark CA as invalid when Validade string is zero', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025',
                        Validade: '0'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.hasValidCaRegistration).toBe(false);
    });

    it('should mark CA as valid when StatusValidade string is one', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025',
                        StatusValidade: '1'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.hasValidCaRegistration).toBe(true);
    });

    it('should treat unrecognized Validade string as active registration', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025',
                        Validade: 'DESCONHECIDO'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.hasValidCaRegistration).toBe(true);
    });

    it('should mark CA as invalid when Validade string is FALSO', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025',
                        Validade: 'FALSO'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.hasValidCaRegistration).toBe(false);
    });

    it('should mark CA as invalid when Validade string is N', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025',
                        Validade: 'N'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.hasValidCaRegistration).toBe(false);
    });

    it('should mark CA as invalid when Validade string is FALSE', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025',
                        Validade: 'FALSE'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.hasValidCaRegistration).toBe(false);
    });

    it('should mark CA as valid when StatusValidade string is TRUE', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025',
                        StatusValidade: 'TRUE'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.hasValidCaRegistration).toBe(true);
    });

    it('should mark CA as invalid when Validade string is NÃO', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        RegistroCA: '11070',
                        NomeEquipamento: 'Capacete',
                        DataValidade: '25/12/2025',
                        Validade: 'NÃO'
                    })
            })
        );

        const result = await epiProvider.getEpiByCa('11070');

        expect(result.hasValidCaRegistration).toBe(false);
    });
});
