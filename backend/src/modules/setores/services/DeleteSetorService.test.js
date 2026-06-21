import { jest } from '@jest/globals';

const setorRepositoryMock = {
    findById: jest.fn(),
    countEmployeesBySetorId: jest.fn(),
    deactivate: jest.fn()
};

jest.unstable_mockModule('../repositories/SetorRepository.js', () => ({
    default: setorRepositoryMock
}));

const deleteSetorService = (await import('./DeleteSetorService.js')).default;

describe('DeleteSetorService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve desativar setor sem funcionários vinculados', async () => {
        setorRepositoryMock.findById.mockResolvedValue({ id: '1', isActive: true });
        setorRepositoryMock.countEmployeesBySetorId.mockResolvedValue(0);

        await deleteSetorService.execute('1');

        expect(setorRepositoryMock.deactivate).toHaveBeenCalledWith('1');
    });

    it('deve lançar erro 404 quando setor não existe', async () => {
        setorRepositoryMock.findById.mockResolvedValue(null);

        await expect(deleteSetorService.execute('1')).rejects.toMatchObject({ statusCode: 404 });
    });

    it('deve bloquear exclusão com funcionários vinculados', async () => {
        setorRepositoryMock.findById.mockResolvedValue({ id: '1', isActive: true });
        setorRepositoryMock.countEmployeesBySetorId.mockResolvedValue(1);

        await expect(deleteSetorService.execute('1')).rejects.toMatchObject({ statusCode: 409 });
        expect(setorRepositoryMock.deactivate).not.toHaveBeenCalled();
    });
});
