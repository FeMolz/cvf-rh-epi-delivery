import { jest } from '@jest/globals';

const prismaMock = {
    candidatura: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn()
    }
};

jest.unstable_mockModule('../../../config/database.js', () => ({
    default: prismaMock
}));

const candidaturaRepository = (await import('./CandidaturaRepository.js')).default;

const selecaoListagemEsperada = {
    id: true,
    anuncioVagaId: true,
    nomeCompleto: true,
    email: true,
    telefone: true,
    cpf: true,
    cidade: true,
    estado: true,
    linkedinUrl: true,
    pretensaoSalarial: true,
    disponibilidadeInicio: true,
    mensagemCandidato: true,
    curriculoNomeArquivo: true,
    curriculoTipoMime: true,
    curriculoTamanhoBytes: true,
    createdAt: true,
    anuncioVaga: {
        select: {
            id: true,
            tituloVaga: true,
            status: true,
            roleId: true,
            companyId: true,
            setorId: true
        }
    }
};

describe('CandidaturaRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar candidatura com dados informados', async () => {
        const dados = {
            anuncioVagaId: 'v1',
            nomeCompleto: 'Maria',
            email: 'm@e.com',
            curriculoConteudo: Buffer.from('pdf')
        };
        const criada = { id: 'c1', ...dados };
        prismaMock.candidatura.create.mockResolvedValue(criada);

        const resultado = await candidaturaRepository.create(dados);

        expect(prismaMock.candidatura.create).toHaveBeenCalledWith({
            data: dados,
            select: selecaoListagemEsperada
        });
        expect(resultado).toEqual(criada);
    });

    it('deve buscar candidatura por id', async () => {
        const candidatura = { id: 'c1' };
        prismaMock.candidatura.findUnique.mockResolvedValue(candidatura);

        const resultado = await candidaturaRepository.findById('c1');

        expect(prismaMock.candidatura.findUnique).toHaveBeenCalledWith({
            where: { id: 'c1' },
            select: selecaoListagemEsperada
        });
        expect(resultado).toEqual(candidatura);
    });

    it('deve buscar candidatura por id com curriculo completo', async () => {
        const candidatura = { id: 'c1', curriculoConteudo: Buffer.from('x') };
        prismaMock.candidatura.findUnique.mockResolvedValue(candidatura);

        const resultado = await candidaturaRepository.findByIdComCurriculo('c1');

        expect(prismaMock.candidatura.findUnique).toHaveBeenCalledWith({
            where: { id: 'c1' }
        });
        expect(resultado).toEqual(candidatura);
    });

    it('deve listar candidaturas por anuncio ordenadas por createdAt asc', async () => {
        const lista = [{ id: 'c1' }, { id: 'c2' }];
        prismaMock.candidatura.findMany.mockResolvedValue(lista);

        const resultado = await candidaturaRepository.findManyByAnuncio('v1');

        expect(prismaMock.candidatura.findMany).toHaveBeenCalledWith({
            where: { anuncioVagaId: 'v1' },
            select: selecaoListagemEsperada,
            orderBy: { createdAt: 'asc' }
        });
        expect(resultado).toEqual(lista);
    });

    it('deve listar candidaturas com filtro de periodo', async () => {
        const dataInicio = new Date('2026-01-01');
        const dataFim = new Date('2026-12-31');
        prismaMock.candidatura.findMany.mockResolvedValue([]);

        await candidaturaRepository.findManyByAnuncio('v1', { dataInicio, dataFim });

        expect(prismaMock.candidatura.findMany).toHaveBeenCalledWith({
            where: {
                anuncioVagaId: 'v1',
                createdAt: { gte: dataInicio, lte: dataFim }
            },
            select: selecaoListagemEsperada,
            orderBy: { createdAt: 'asc' }
        });
    });

    it('deve contar candidaturas por anuncio', async () => {
        prismaMock.candidatura.count.mockResolvedValue(5);

        const resultado = await candidaturaRepository.countByAnuncio('v1');

        expect(prismaMock.candidatura.count).toHaveBeenCalledWith({
            where: { anuncioVagaId: 'v1' }
        });
        expect(resultado).toBe(5);
    });
});
