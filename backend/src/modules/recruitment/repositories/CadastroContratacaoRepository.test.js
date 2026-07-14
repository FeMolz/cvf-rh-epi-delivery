import { jest } from '@jest/globals';

const prismaMock = {
    cadastroContratacao: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
    }
};

jest.unstable_mockModule('../../../config/database.js', () => ({
    default: prismaMock
}));

const cadastroContratacaoRepository = (await import('./CadastroContratacaoRepository.js')).default;

describe('CadastroContratacaoRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar cadastro de contratacao', async () => {
        const dados = { candidaturaId: 'c1', tokenAcesso: 'tok', roleId: 'r1' };
        prismaMock.cadastroContratacao.create.mockResolvedValue({ id: 'cad1', ...dados });

        const resultado = await cadastroContratacaoRepository.create(dados);

        expect(prismaMock.cadastroContratacao.create).toHaveBeenCalledWith(
            expect.objectContaining({ data: dados })
        );
        expect(resultado.id).toBe('cad1');
    });

    it('deve buscar por token', async () => {
        prismaMock.cadastroContratacao.findUnique.mockResolvedValue({ id: 'cad1' });

        await cadastroContratacaoRepository.findByToken('tok');

        expect(prismaMock.cadastroContratacao.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({ where: { tokenAcesso: 'tok' } })
        );
    });

    it('deve listar com filtro de status', async () => {
        prismaMock.cadastroContratacao.findMany.mockResolvedValue([]);

        await cadastroContratacaoRepository.findMany({ status: 'AGUARDANDO_ANALISE_RH' });

        expect(prismaMock.cadastroContratacao.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { status: 'AGUARDANDO_ANALISE_RH' },
                orderBy: { enviadoEm: 'desc' }
            })
        );
    });

    it('deve excluir cadastro', async () => {
        await cadastroContratacaoRepository.delete('cad1');

        expect(prismaMock.cadastroContratacao.delete).toHaveBeenCalledWith({
            where: { id: 'cad1' }
        });
    });

    it('deve buscar por id', async () => {
        prismaMock.cadastroContratacao.findUnique.mockResolvedValue({ id: 'cad1' });

        const resultado = await cadastroContratacaoRepository.findById('cad1');

        expect(prismaMock.cadastroContratacao.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 'cad1' } })
        );
        expect(resultado).toEqual({ id: 'cad1' });
    });

    it('deve buscar por candidaturaId', async () => {
        prismaMock.cadastroContratacao.findUnique.mockResolvedValue({ id: 'cad1' });

        await cadastroContratacaoRepository.findByCandidaturaId('c1');

        expect(prismaMock.cadastroContratacao.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({ where: { candidaturaId: 'c1' } })
        );
    });

    it('deve listar sem filtro de status', async () => {
        prismaMock.cadastroContratacao.findMany.mockResolvedValue([]);

        await cadastroContratacaoRepository.findMany();

        expect(prismaMock.cadastroContratacao.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ where: {} })
        );
    });

    it('deve atualizar cadastro', async () => {
        const dados = { status: 'CONTRATADO' };
        prismaMock.cadastroContratacao.update.mockResolvedValue({ id: 'cad1', ...dados });

        const resultado = await cadastroContratacaoRepository.update('cad1', dados);

        expect(prismaMock.cadastroContratacao.update).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 'cad1' }, data: dados })
        );
        expect(resultado.status).toBe('CONTRATADO');
    });
});
