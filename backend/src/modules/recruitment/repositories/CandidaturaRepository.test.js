import { jest } from '@jest/globals';

const prismaMock = {
    candidatura: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn()
    }
};

jest.unstable_mockModule('../../../config/database.js', () => ({
    default: prismaMock
}));

const candidaturaRepository = (await import('./CandidaturaRepository.js')).default;

const selecaoListagemEsperada = {
    id: true,
    anuncioVagaId: true,
    userId: true,
    status: true,
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
    descricaoVisualizadaEm: true,
    curriculoVisualizadoEm: true,
    descartadoEm: true,
    reativadoEm: true,
    createdAt: true,
    updatedAt: true,
    anuncioVaga: {
        select: {
            id: true,
            tituloVaga: true,
            status: true,
            roleId: true,
            companyId: true,
            setorId: true
        }
    },
    user: {
        select: { id: true, name: true, email: true }
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

    it('deve buscar candidatura ativa por anuncio e email', async () => {
        const candidatura = { id: 'c1' };
        prismaMock.candidatura.findFirst.mockResolvedValue(candidatura);

        const resultado = await candidaturaRepository.findByAnuncioAndEmail('v1', 'maria@email.com');

        expect(prismaMock.candidatura.findFirst).toHaveBeenCalledWith({
            where: {
                anuncioVagaId: 'v1',
                email: 'maria@email.com',
                status: { not: 'DESCARTADO' }
            },
            select: selecaoListagemEsperada
        });
        expect(resultado).toEqual(candidatura);
    });

    it('deve buscar candidatura por anuncio e usuario', async () => {
        const candidatura = { id: 'c1' };
        prismaMock.candidatura.findFirst.mockResolvedValue(candidatura);

        const resultado = await candidaturaRepository.findByAnuncioAndUser('v1', 'u1');

        expect(prismaMock.candidatura.findFirst).toHaveBeenCalledWith({
            where: {
                anuncioVagaId: 'v1',
                userId: 'u1'
            },
            select: selecaoListagemEsperada
        });
        expect(resultado).toEqual(candidatura);
    });

    it('deve listar reativados com filtro de vaga e periodo', async () => {
        const dataInicio = new Date('2026-01-01');
        const dataFim = new Date('2026-12-31');
        prismaMock.candidatura.findMany.mockResolvedValue([]);

        await candidaturaRepository.findMany({
            reativados: true,
            anuncioVagaId: 'v1',
            dataInicio,
            dataFim
        });

        expect(prismaMock.candidatura.findMany).toHaveBeenCalledWith({
            where: {
                reativadoEm: { not: null },
                status: { not: 'DESCARTADO' },
                anuncioVagaId: 'v1',
                createdAt: { gte: dataInicio, lte: dataFim }
            },
            select: selecaoListagemEsperada,
            orderBy: { createdAt: 'desc' }
        });
    });

    it('deve listar reativados excluindo quem ja tem cadastro ativo', async () => {
        prismaMock.candidatura.findMany.mockResolvedValue([]);

        await candidaturaRepository.findMany({ reativados: true, excluirComCadastroAtivo: true });

        expect(prismaMock.candidatura.findMany).toHaveBeenCalledWith({
            where: {
                reativadoEm: { not: null },
                status: { not: 'DESCARTADO' },
                AND: [{ cadastroContratacao: null }]
            },
            select: selecaoListagemEsperada,
            orderBy: { createdAt: 'desc' }
        });
    });

    it('deve excluir reativados da listagem geral de candidaturas', async () => {
        prismaMock.candidatura.findMany.mockResolvedValue([]);

        await candidaturaRepository.findMany({ excluirReativadosSemVaga: true });

        expect(prismaMock.candidatura.findMany).toHaveBeenCalledWith({
            where: {
                status: { not: 'DESCARTADO' },
                AND: [{ reativadoEm: null }]
            },
            select: selecaoListagemEsperada,
            orderBy: { createdAt: 'desc' }
        });
    });

    it('deve listar candidaturas por anuncio excluindo descartadas por padrao', async () => {
        const lista = [{ id: 'c1' }, { id: 'c2' }];
        prismaMock.candidatura.findMany.mockResolvedValue(lista);

        const resultado = await candidaturaRepository.findManyByAnuncio('v1');

        expect(prismaMock.candidatura.findMany).toHaveBeenCalledWith({
            where: { anuncioVagaId: 'v1', status: { not: 'DESCARTADO' } },
            select: selecaoListagemEsperada,
            orderBy: { createdAt: 'desc' }
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
                status: { not: 'DESCARTADO' },
                createdAt: { gte: dataInicio, lte: dataFim }
            },
            select: selecaoListagemEsperada,
            orderBy: { createdAt: 'desc' }
        });
    });

    it('deve contar candidaturas por anuncio excluindo descartadas', async () => {
        prismaMock.candidatura.count.mockResolvedValue(5);

        const resultado = await candidaturaRepository.countByAnuncio('v1');

        expect(prismaMock.candidatura.count).toHaveBeenCalledWith({
            where: { anuncioVagaId: 'v1', status: { not: 'DESCARTADO' } }
        });
        expect(resultado).toBe(5);
    });

    it('deve listar todas as candidaturas sem filtro de vaga', async () => {
        const lista = [{ id: 'c1' }, { id: 'c2' }];
        prismaMock.candidatura.findMany.mockResolvedValue(lista);

        const resultado = await candidaturaRepository.findMany();

        expect(prismaMock.candidatura.findMany).toHaveBeenCalledWith({
            where: { status: { not: 'DESCARTADO' } },
            select: selecaoListagemEsperada,
            orderBy: { createdAt: 'desc' }
        });
        expect(resultado).toEqual(lista);
    });

    it('deve listar candidaturas com filtro de vaga via findMany', async () => {
        prismaMock.candidatura.findMany.mockResolvedValue([]);

        await candidaturaRepository.findMany({ anuncioVagaId: 'v1', status: 'PENDENTE' });

        expect(prismaMock.candidatura.findMany).toHaveBeenCalledWith({
            where: { anuncioVagaId: 'v1', status: 'PENDENTE' },
            select: selecaoListagemEsperada,
            orderBy: { createdAt: 'desc' }
        });
    });

    it('deve ordenar candidaturas pelos mais antigos', async () => {
        prismaMock.candidatura.findMany.mockResolvedValue([]);

        await candidaturaRepository.findMany({ ordenacao: 'ANTIGOS' });

        expect(prismaMock.candidatura.findMany).toHaveBeenCalledWith({
            where: { status: { not: 'DESCARTADO' } },
            select: selecaoListagemEsperada,
            orderBy: { createdAt: 'asc' }
        });
    });

    it('deve excluir candidaturas com cadastro ativo na listagem geral', async () => {
        prismaMock.candidatura.findMany.mockResolvedValue([]);

        await candidaturaRepository.findMany({ excluirComCadastroAtivo: true });

        expect(prismaMock.candidatura.findMany).toHaveBeenCalledWith({
            where: {
                status: { not: 'DESCARTADO' },
                AND: [{ cadastroContratacao: null }]
            },
            select: selecaoListagemEsperada,
            orderBy: { createdAt: 'desc' }
        });
    });

    it('deve atualizar candidatura', async () => {
        const dados = { status: 'PROXIMA_FASE' };
        prismaMock.candidatura.update.mockResolvedValue({ id: 'c1', ...dados });

        const resultado = await candidaturaRepository.update('c1', dados);

        expect(prismaMock.candidatura.update).toHaveBeenCalledWith({
            where: { id: 'c1' },
            data: dados,
            select: selecaoListagemEsperada
        });
        expect(resultado.status).toBe('PROXIMA_FASE');
    });

    it('deve listar reativados apenas com dataInicio', async () => {
        const dataInicio = new Date('2026-01-01');
        prismaMock.candidatura.findMany.mockResolvedValue([]);

        await candidaturaRepository.findMany({
            reativados: true,
            dataInicio
        });

        expect(prismaMock.candidatura.findMany).toHaveBeenCalledWith({
            where: {
                reativadoEm: { not: null },
                status: { not: 'DESCARTADO' },
                createdAt: { gte: dataInicio }
            },
            select: selecaoListagemEsperada,
            orderBy: { createdAt: 'desc' }
        });
    });

    it('deve listar incluindo descartadas quando solicitado', async () => {
        prismaMock.candidatura.findMany.mockResolvedValue([]);

        await candidaturaRepository.findMany({ incluirDescartadas: true });

        expect(prismaMock.candidatura.findMany).toHaveBeenCalledWith({
            where: {},
            select: selecaoListagemEsperada,
            orderBy: { createdAt: 'desc' }
        });
    });

    it('deve listar com filtro apenas de dataInicio', async () => {
        const dataInicio = new Date('2026-01-01');
        prismaMock.candidatura.findMany.mockResolvedValue([]);

        await candidaturaRepository.findMany({ dataInicio });

        expect(prismaMock.candidatura.findMany).toHaveBeenCalledWith({
            where: {
                status: { not: 'DESCARTADO' },
                createdAt: { gte: dataInicio }
            },
            select: selecaoListagemEsperada,
            orderBy: { createdAt: 'desc' }
        });
    });

    it('deve montar condicao where via metodo publico', () => {
        const condicao = candidaturaRepository.montarCondicaoWhere({ status: 'PENDENTE' });

        expect(condicao).toEqual({ status: 'PENDENTE' });
    });

    it('deve montar condicao where padrao sem filtros', () => {
        const condicao = candidaturaRepository.montarCondicaoWhere();

        expect(condicao).toEqual({ status: { not: 'DESCARTADO' } });
    });

    it('deve listar reativados apenas com dataFim', async () => {
        const dataFim = new Date('2026-12-31');
        prismaMock.candidatura.findMany.mockResolvedValue([]);

        await candidaturaRepository.findMany({
            reativados: true,
            dataFim
        });

        expect(prismaMock.candidatura.findMany).toHaveBeenCalledWith({
            where: {
                reativadoEm: { not: null },
                status: { not: 'DESCARTADO' },
                createdAt: { lte: dataFim }
            },
            select: selecaoListagemEsperada,
            orderBy: { createdAt: 'desc' }
        });
    });

    it('deve listar com filtro apenas de dataFim', async () => {
        const dataFim = new Date('2026-12-31');
        prismaMock.candidatura.findMany.mockResolvedValue([]);

        await candidaturaRepository.findMany({ dataFim });

        expect(prismaMock.candidatura.findMany).toHaveBeenCalledWith({
            where: {
                status: { not: 'DESCARTADO' },
                createdAt: { lte: dataFim }
            },
            select: selecaoListagemEsperada,
            orderBy: { createdAt: 'desc' }
        });
    });

    it('deve remover candidaturas descartadas antigas', async () => {
        prismaMock.candidatura.deleteMany.mockResolvedValue({ count: 4 });
        const dataLimite = new Date('2026-01-01');

        const resultado = await candidaturaRepository.deleteManyDescartadasAntigas(dataLimite);

        expect(prismaMock.candidatura.deleteMany).toHaveBeenCalledWith({
            where: {
                status: 'DESCARTADO',
                descartadoEm: { lt: dataLimite }
            }
        });
        expect(resultado).toBe(4);
    });

    it('deve contar candidaturas globalmente excluindo descartadas', async () => {
        prismaMock.candidatura.count.mockResolvedValue(10);

        const resultado = await candidaturaRepository.count();

        expect(prismaMock.candidatura.count).toHaveBeenCalledWith({
            where: { status: { not: 'DESCARTADO' } }
        });
        expect(resultado).toBe(10);
    });
});
