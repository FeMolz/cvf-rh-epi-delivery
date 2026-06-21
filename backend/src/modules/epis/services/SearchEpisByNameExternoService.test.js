import { jest } from '@jest/globals';

const epiProviderMock = {
    buscarEpisPorNomeEquipamento: jest.fn()
};

jest.unstable_mockModule('../../../shared/providers/EpiProvider/EpiProvider.js', () => ({
    default: epiProviderMock
}));

const searchEpisByNameExternoService = (await import('./SearchEpisByNameExternoService.js')).default;

describe('SearchEpisByNameExternoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
});
