import { jest } from '@jest/globals';

const epiRepositoryMock = {
    findAllEpis: jest.fn()
};

jest.unstable_mockModule('../repositories/EpiRepository.js', () => ({
    default: epiRepositoryMock
}));

const listCachedEpisService = (await import('./ListCachedEpisService.js')).default;

describe('ListCachedEpisService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('execute deve delegar ao repositório', async () => {
        epiRepositoryMock.findAllEpis.mockResolvedValue([{ id: '1' }]);
        const resultado = await listCachedEpisService.execute();
        expect(resultado).toEqual([{ id: '1' }]);
        expect(epiRepositoryMock.findAllEpis).toHaveBeenCalledTimes(1);
    });
});
