import { jest } from '@jest/globals';

const setorRepositoryMock = {
    findByNome: jest.fn(),
    create: jest.fn()
};

jest.unstable_mockModule('../repositories/SetorRepository.js', () => ({
    default: setorRepositoryMock
}));

const createSetorService = (await import('./CreateSetorService.js')).default;

describe('CreateSetorService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar setor com sucesso', async () => {
        const dados = { nome: 'TI' };
        const setorCriado = { id: '1', nome: 'TI', isActive: true };

        setorRepositoryMock.findByNome.mockResolvedValue(null);
        setorRepositoryMock.create.mockResolvedValue(setorCriado);

        const resultado = await createSetorService.execute(dados);

        expect(setorRepositoryMock.create).toHaveBeenCalledWith({ nome: 'TI', isActive: true });
        expect(resultado).toEqual(setorCriado);
    });

    it('deve rejeitar nome vazio', async () => {
        await expect(createSetorService.execute({ nome: '  ' })).rejects.toThrow(
            'O nome do setor é obrigatório.'
        );
    });

    it('deve rejeitar nome duplicado', async () => {
        setorRepositoryMock.findByNome.mockResolvedValue({ id: '2', nome: 'TI' });

        await expect(createSetorService.execute({ nome: 'TI' })).rejects.toThrow(
            'Já existe um setor cadastrado com este nome.'
        );
    });
});
