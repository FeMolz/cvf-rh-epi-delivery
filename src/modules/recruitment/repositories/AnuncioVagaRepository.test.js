import { jest } from '@jest/globals';

const prismaMock = {
    anuncioVaga: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn()
    }
};

jest.unstable_mockModule('../../../config/database.js', () => ({
    default: prismaMock
}));

const anuncioVagaRepository = (await import('./AnuncioVagaRepository.js')).default;

const selecaoEsperada = {
    id: true,
    tituloVaga: true,
    apresentacaoEmpresa: true,
    sobreVaga: true,
    responsabilidades: true,
    requisitos: true,
    beneficios: true,
    localTrabalho: true,
    tipoContratacao: true,
    jornadaTrabalho: true,
    faixaSalarial: true,
    roleId: true,
    companyId: true,
    setorId: true,
    status: true,
    criadoPorUserId: true,
    createdAt: true,
    updatedAt: true,
    role: { select: { id: true, name: true, description: true } },
    company: { select: { id: true, name: true, cnpj: true } },
    setor: { select: { id: true, nome: true } },
    criadoPor: {
        select: { id: true, name: true, email: true }
    }
};

describe('AnuncioVagaRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar anuncio com dados informados', async () => {
        const dados = { tituloVaga: 'Analista', criadoPorUserId: 'u1' };
        const criado = { id: 'v1', ...dados };
        prismaMock.anuncioVaga.create.mockResolvedValue(criado);

        const resultado = await anuncioVagaRepository.create(dados);

        expect(prismaMock.anuncioVaga.create).toHaveBeenCalledWith({
            data: dados,
            select: selecaoEsperada
        });
        expect(resultado).toEqual(criado);
    });

    it('deve buscar anuncio por id', async () => {
        const anuncio = { id: 'v1' };
        prismaMock.anuncioVaga.findUnique.mockResolvedValue(anuncio);

        const resultado = await anuncioVagaRepository.findById('v1');

        expect(prismaMock.anuncioVaga.findUnique).toHaveBeenCalledWith({
            where: { id: 'v1' },
            select: selecaoEsperada
        });
        expect(resultado).toEqual(anuncio);
    });

    it('deve listar anuncios sem filtro de status', async () => {
        const lista = [{ id: 'v1' }];
        prismaMock.anuncioVaga.findMany.mockResolvedValue(lista);

        const resultado = await anuncioVagaRepository.findMany();

        expect(prismaMock.anuncioVaga.findMany).toHaveBeenCalledWith({
            where: {},
            select: selecaoEsperada,
            orderBy: { createdAt: 'desc' }
        });
        expect(resultado).toEqual(lista);
    });

    it('deve listar anuncios filtrando por status', async () => {
        prismaMock.anuncioVaga.findMany.mockResolvedValue([]);

        await anuncioVagaRepository.findMany({ status: 'ATIVA' });

        expect(prismaMock.anuncioVaga.findMany).toHaveBeenCalledWith({
            where: { status: 'ATIVA' },
            select: selecaoEsperada,
            orderBy: { createdAt: 'desc' }
        });
    });

    it('deve atualizar anuncio', async () => {
        const dados = { tituloVaga: 'Novo titulo' };
        const atualizado = { id: 'v1', ...dados };
        prismaMock.anuncioVaga.update.mockResolvedValue(atualizado);

        const resultado = await anuncioVagaRepository.update('v1', dados);

        expect(prismaMock.anuncioVaga.update).toHaveBeenCalledWith({
            where: { id: 'v1' },
            data: dados,
            select: selecaoEsperada
        });
        expect(resultado).toEqual(atualizado);
    });
});
