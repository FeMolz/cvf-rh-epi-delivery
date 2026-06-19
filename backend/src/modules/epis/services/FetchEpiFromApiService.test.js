import { jest } from '@jest/globals';

const epiRepositoryMock = {
    findByCaNumber: jest.fn(),
    createEpi: jest.fn()
};

const epiProviderMock = {
    getEpiByCa: jest.fn()
};

jest.unstable_mockModule('../repositories/EpiRepository.js', () => ({
    default: epiRepositoryMock
}));

jest.unstable_mockModule('../../../shared/providers/EpiProvider/EpiProvider.js', () => ({
    default: epiProviderMock
}));

const fetchEpiFromApiService = (await import('./FetchEpiFromApiService.js')).default;

describe('FetchEpiFromApiService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return local epi if it exists and is active', async () => {
        const mockEpi = { id: 1, caNumber: '11070', name: 'Capacete', isActive: true };
        epiRepositoryMock.findByCaNumber.mockResolvedValue(mockEpi);

        const result = await fetchEpiFromApiService.execute('11070');
        expect(result).toEqual(mockEpi);
        expect(epiRepositoryMock.findByCaNumber).toHaveBeenCalledWith('11070');
        expect(epiProviderMock.getEpiByCa).not.toHaveBeenCalled();
    });

    it('should throw when local epi exists but CA validity is inactive', async () => {
        const mockEpi = { id: 1, caNumber: '11070', name: 'Capacete', isActive: false };
        epiRepositoryMock.findByCaNumber.mockResolvedValue(mockEpi);

        await expect(fetchEpiFromApiService.execute('11070')).rejects.toThrow(
            'Este CA não possui validade ativa. Não é permitido utilizar este EPI.'
        );
        expect(epiProviderMock.getEpiByCa).not.toHaveBeenCalled();
    });

    it('should throw error if API returns null', async () => {
        epiRepositoryMock.findByCaNumber.mockResolvedValue(null);
        epiProviderMock.getEpiByCa.mockResolvedValue(null);

        await expect(fetchEpiFromApiService.execute('99999')).rejects.toThrow('EPI com este CA não encontrado na base pública.');
    });

    it('should throw when API payload indicates CA without active validity', async () => {
        epiRepositoryMock.findByCaNumber.mockResolvedValue(null);
        epiProviderMock.getEpiByCa.mockResolvedValue({
            caNumber: '99999',
            name: 'EPI',
            expirationDate: new Date(),
            isActive: false,
            hasValidCaRegistration: false
        });

        await expect(fetchEpiFromApiService.execute('99999')).rejects.toThrow(
            'Este CA não possui validade ativa no cadastro oficial. Não é permitido utilizar este EPI.'
        );
        expect(epiRepositoryMock.createEpi).not.toHaveBeenCalled();
    });

    it('should fetch from API and save to DB if local does not exist', async () => {
        epiRepositoryMock.findByCaNumber.mockResolvedValue(null);
        const apiData = {
            caNumber: '11070',
            name: 'Capacete',
            expirationDate: new Date(),
            isActive: true,
            hasValidCaRegistration: true
        };
        epiProviderMock.getEpiByCa.mockResolvedValue(apiData);

        const createdEpi = { id: 2, ...apiData };
        epiRepositoryMock.createEpi.mockResolvedValue(createdEpi);

        const result = await fetchEpiFromApiService.execute('11070');
        expect(result).toEqual(createdEpi);
        expect(epiRepositoryMock.createEpi).toHaveBeenCalled();
    });
});
