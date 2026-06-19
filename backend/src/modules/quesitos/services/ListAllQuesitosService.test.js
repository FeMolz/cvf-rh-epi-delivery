import { jest } from '@jest/globals';

const quesitoRepositoryMock = {
  findAllOrdered: jest.fn()
};

jest.unstable_mockModule('../repositories/QuesitoRepository.js', () => ({
  default: quesitoRepositoryMock
}));

const listAllQuesitosService = (await import('./ListAllQuesitosService.js')).default;

describe('ListAllQuesitosService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar todos os quesitos ordenados', async () => {
    const lista = [
      { id: '1', nome: 'a', bloco: 'SST' },
      { id: '2', nome: 'b', bloco: 'SST' }
    ];
    quesitoRepositoryMock.findAllOrdered.mockResolvedValue(lista);

    const resultado = await listAllQuesitosService.execute();

    expect(quesitoRepositoryMock.findAllOrdered).toHaveBeenCalledTimes(1);
    expect(resultado).toEqual(lista);
  });
});
