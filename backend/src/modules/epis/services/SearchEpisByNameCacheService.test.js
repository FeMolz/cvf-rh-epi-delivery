import { jest } from '@jest/globals';

const epiRepositoryMock = {
    findAtivosPorNomeContendo: jest.fn()
};

jest.unstable_mockModule('../repositories/EpiRepository.js', () => ({
    default: epiRepositoryMock
}));

const searchEpisByNameCacheService = (await import('./SearchEpisByNameCacheService.js')).default;

describe('SearchEpisByNameCacheService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve buscar epis ativos no cache por nome', async () => {
        epiRepositoryMock.findAtivosPorNomeContendo.mockResolvedValue([
            { caNumber: '11070', name: 'Capacete' }
        ]);

        const resultado = await searchEpisByNameCacheService.execute('cap');

        expect(epiRepositoryMock.findAtivosPorNomeContendo).toHaveBeenCalledWith('cap', 50);
        expect(resultado).toEqual([{ caNumber: '11070', name: 'Capacete' }]);
    });

    it('deve rejeitar termo vazio', async () => {
        await expect(searchEpisByNameCacheService.execute('')).rejects.toMatchObject({
            statusCode: 400
        });
    });

    it('deve rejeitar termo curto', async () => {
        await expect(searchEpisByNameCacheService.execute('a')).rejects.toMatchObject({
            statusCode: 400
        });
    });
});
