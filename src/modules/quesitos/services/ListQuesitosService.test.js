import { jest } from '@jest/globals';
import { MENSAGEM_QUESITO_NAO_ENCONTRADO } from '../constants/quesitoConstantes.js';

const quesitoRepositoryMock = {
    findByNome: jest.fn(),
    findManyByBloco: jest.fn(),
    findAllOrdered: jest.fn()
};

jest.unstable_mockModule('../repositories/QuesitoRepository.js', () => ({
    default: quesitoRepositoryMock
}));

const listQuesitosService = (await import('./ListQuesitosService.js')).default;

describe('ListQuesitosService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve rejeitar quando nome e bloco sao informados juntos', async () => {
        await expect(
            listQuesitosService.execute({ nomeFiltro: 'a', blocoFiltro: 'b' })
        ).rejects.toThrow('Informe apenas um filtro: nome ou bloco (query string).');
    });

    it('deve retornar array com um quesito quando filtro por nome encontra', async () => {
        const quesito = { id: '1', nome: 'unico' };
        quesitoRepositoryMock.findByNome.mockResolvedValue(quesito);

        const resultado = await listQuesitosService.execute({ nomeFiltro: 'unico' });

        expect(quesitoRepositoryMock.findByNome).toHaveBeenCalledWith('unico');
        expect(resultado).toEqual([quesito]);
    });

    it('deve lancar quando filtro por nome nao encontra', async () => {
        quesitoRepositoryMock.findByNome.mockResolvedValue(null);

        await expect(listQuesitosService.execute({ nomeFiltro: 'inexistente' })).rejects.toThrow(
            MENSAGEM_QUESITO_NAO_ENCONTRADO
        );
    });

    it('deve listar por bloco', async () => {
        const lista = [{ id: '1', bloco: 'SST' }];
        quesitoRepositoryMock.findManyByBloco.mockResolvedValue(lista);

        const resultado = await listQuesitosService.execute({ blocoFiltro: ' SST ' });

        expect(quesitoRepositoryMock.findManyByBloco).toHaveBeenCalledWith('SST');
        expect(resultado).toEqual(lista);
    });

    it('deve listar todos quando nao ha filtro', async () => {
        const lista = [{ id: '1' }];
        quesitoRepositoryMock.findAllOrdered.mockResolvedValue(lista);

        const resultado = await listQuesitosService.execute({});

        expect(quesitoRepositoryMock.findAllOrdered).toHaveBeenCalled();
        expect(resultado).toEqual(lista);
    });
});
