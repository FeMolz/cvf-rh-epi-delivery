import { jest } from '@jest/globals';

const prismaMock = {
    epi: {
        findUnique: jest.fn(),
        create: jest.fn()
    }
};

const epiProviderMock = {
    getEpiByCa: jest.fn()
};

jest.unstable_mockModule('../../../config/database.js', () => ({
    default: prismaMock
}));

jest.unstable_mockModule('../../../shared/providers/EpiProvider/EpiProvider.js', () => ({
    default: epiProviderMock
}));

const fetchEpiFromApiService = (await import('./FetchEpiFromApiService.js')).default;

describe('FetchEpiFromApiService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return local epi if it exists', async () => {
        const mockEpi = { id: 1, caNumber: '11070', name: 'Capacete' };
        prismaMock.epi.findUnique.mockResolvedValue(mockEpi);

        const result = await fetchEpiFromApiService.execute('11070');
        expect(result).toEqual(mockEpi);
        expect(prismaMock.epi.findUnique).toHaveBeenCalledWith({ where: { caNumber: '11070' } });
        expect(epiProviderMock.getEpiByCa).not.toHaveBeenCalled();
    });

    it('should throw error if API returns null', async () => {
        prismaMock.epi.findUnique.mockResolvedValue(null);
        epiProviderMock.getEpiByCa.mockResolvedValue(null);

        await expect(fetchEpiFromApiService.execute('99999')).rejects.toThrow('EPI com este CA não encontrado na base pública.');
    });

    it('should fetch from API and save to DB if local does not exist', async () => {
        prismaMock.epi.findUnique.mockResolvedValue(null);
        const apiData = { caNumber: '11070', name: 'Capacete', expirationDate: new Date(), isActive: true };
        epiProviderMock.getEpiByCa.mockResolvedValue(apiData);
        
        const createdEpi = { id: 2, ...apiData };
        prismaMock.epi.create.mockResolvedValue(createdEpi);

        const result = await fetchEpiFromApiService.execute('11070');
        expect(result).toEqual(createdEpi);
        expect(prismaMock.epi.create).toHaveBeenCalled();
    });
});
