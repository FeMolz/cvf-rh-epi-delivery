import { jest } from '@jest/globals';

const setorRepositoryMock = {
    findAllOrdered: jest.fn()
};

jest.unstable_mockModule('../repositories/SetorRepository.js', () => ({
    default: setorRepositoryMock
}));

const listSetoresService = (await import('./ListSetoresService.js')).default;

describe('ListSetoresService', () => {
    it('deve retornar setores ordenados', async () => {
        const setores = [{ id: '1', nome: 'TI' }];
        setorRepositoryMock.findAllOrdered.mockResolvedValue(setores);

        const resultado = await listSetoresService.execute();

        expect(setorRepositoryMock.findAllOrdered).toHaveBeenCalledTimes(1);
        expect(resultado).toEqual(setores);
    });
});
