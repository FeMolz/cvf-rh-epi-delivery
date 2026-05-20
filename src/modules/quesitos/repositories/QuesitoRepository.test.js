import { jest } from '@jest/globals';

const prismaMock = {
    quesito: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn()
    }
};

jest.unstable_mockModule('../../../config/database.js', () => ({
    default: prismaMock
}));

const quesitoRepository = (await import('./QuesitoRepository.js')).default;

describe('QuesitoRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar quesito com dados informados', async () => {
        const dados = { nome: 'epi_obrigatorio', descricao: 'Uso de EPI', bloco: 'SST' };
        const criado = { id: 'uuid-1', ...dados };
        prismaMock.quesito.create.mockResolvedValue(criado);

        const resultado = await quesitoRepository.create(dados);

        expect(prismaMock.quesito.create).toHaveBeenCalledWith({ data: dados });
        expect(resultado).toEqual(criado);
    });

    it('deve buscar quesito por nome', async () => {
        const quesito = { id: '1', nome: 'epi_obrigatorio' };
        prismaMock.quesito.findUnique.mockResolvedValue(quesito);

        const resultado = await quesitoRepository.findByNome('epi_obrigatorio');

        expect(prismaMock.quesito.findUnique).toHaveBeenCalledWith({
            where: { nome: 'epi_obrigatorio' }
        });
        expect(resultado).toEqual(quesito);
    });

    it('deve listar quesitos por bloco ordenados', async () => {
        const lista = [{ id: '1', bloco: 'SST' }];
        prismaMock.quesito.findMany.mockResolvedValue(lista);

        const resultado = await quesitoRepository.findManyByBloco('SST');

        expect(prismaMock.quesito.findMany).toHaveBeenCalledWith({
            where: { bloco: 'SST' },
            orderBy: [{ bloco: 'asc' }, { nome: 'asc' }]
        });
        expect(resultado).toEqual(lista);
    });

    it('deve listar todos os quesitos ordenados', async () => {
        const lista = [{ id: '1' }];
        prismaMock.quesito.findMany.mockResolvedValue(lista);

        const resultado = await quesitoRepository.findAllOrdered();

        expect(prismaMock.quesito.findMany).toHaveBeenCalledWith({
            orderBy: [{ bloco: 'asc' }, { nome: 'asc' }]
        });
        expect(resultado).toEqual(lista);
    });

    it('deve buscar quesito por id', async () => {
        const quesito = { id: 'abc' };
        prismaMock.quesito.findUnique.mockResolvedValue(quesito);

        const resultado = await quesitoRepository.findById('abc');

        expect(prismaMock.quesito.findUnique).toHaveBeenCalledWith({
            where: { id: 'abc' }
        });
        expect(resultado).toEqual(quesito);
    });

    it('deve atualizar quesito', async () => {
        const dados = { descricao: 'Nova descrição' };
        const atualizado = { id: 'abc', nome: 'epi', descricao: 'Nova descrição', bloco: 'SST' };
        prismaMock.quesito.update.mockResolvedValue(atualizado);

        const resultado = await quesitoRepository.update('abc', dados);

        expect(prismaMock.quesito.update).toHaveBeenCalledWith({
            where: { id: 'abc' },
            data: dados
        });
        expect(resultado).toEqual(atualizado);
    });
});
