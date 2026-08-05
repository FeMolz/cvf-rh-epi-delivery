import { jest } from '@jest/globals';

const envMock = {
    CAEPI_USAR_SOMENTE_CACHE: false
};

const epiProviderMock = {
    buscarEpisPorNomeEquipamento: jest.fn()
};

const searchEpisByNameCacheServiceMock = {
    execute: jest.fn()
};

jest.unstable_mockModule('../../../config/env.js', () => ({
    default: envMock
}));

jest.unstable_mockModule('../../../shared/providers/EpiProvider/EpiProvider.js', () => ({
    default: epiProviderMock
}));

jest.unstable_mockModule('./SearchEpisByNameCacheService.js', () => ({
    default: searchEpisByNameCacheServiceMock
}));

const searchEpisByNameExternoService = (await import('./SearchEpisByNameExternoService.js')).default;

describe('SearchEpisByNameExternoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        envMock.CAEPI_USAR_SOMENTE_CACHE = false;
    });

    it('deve retornar epis encontrados por nome', async () => {
        epiProviderMock.buscarEpisPorNomeEquipamento.mockResolvedValue([
            { caNumber: '11070', name: 'Capacete' }
        ]);

        const resultado = await searchEpisByNameExternoService.execute('capacete');

        expect(epiProviderMock.buscarEpisPorNomeEquipamento).toHaveBeenCalledWith('capacete');
        expect(resultado).toEqual([{ caNumber: '11070', name: 'Capacete' }]);
    });

    it('deve rejeitar termo vazio', async () => {
        await expect(searchEpisByNameExternoService.execute('')).rejects.toMatchObject({
            statusCode: 400
        });
    });

    it('deve rejeitar termo curto', async () => {
        await expect(searchEpisByNameExternoService.execute('a')).rejects.toMatchObject({
            statusCode: 400
        });
    });

    it('deve usar cache local quando CAEPI_USAR_SOMENTE_CACHE estiver ativo', async () => {
        envMock.CAEPI_USAR_SOMENTE_CACHE = true;
        searchEpisByNameCacheServiceMock.execute.mockResolvedValue([
            { caNumber: '11070', name: 'Capacete' }
        ]);

        const resultado = await searchEpisByNameExternoService.execute('cap');

        expect(searchEpisByNameCacheServiceMock.execute).toHaveBeenCalledWith('cap');
        expect(epiProviderMock.buscarEpisPorNomeEquipamento).not.toHaveBeenCalled();
        expect(resultado).toEqual([{ caNumber: '11070', name: 'Capacete' }]);
    });

    it('deve usar cache local quando a base pública estiver indisponível', async () => {
        epiProviderMock.buscarEpisPorNomeEquipamento.mockRejectedValue(
            new Error('Base CAEPI indisponível')
        );
        searchEpisByNameCacheServiceMock.execute.mockResolvedValue([
            { caNumber: '11070', name: 'Capacete' }
        ]);

        const resultado = await searchEpisByNameExternoService.execute('capacete');

        expect(searchEpisByNameCacheServiceMock.execute).toHaveBeenCalledWith('capacete');
        expect(resultado).toEqual([{ caNumber: '11070', name: 'Capacete' }]);
    });
});
