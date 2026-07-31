import { jest } from '@jest/globals';
import { MENSAGEM_ANUNCIO_NAO_ENCONTRADO } from '../constants/recrutamentoConstantes.js';

const anuncioVagaRepositoryMock = { findById: jest.fn() };
const candidaturaRepositoryMock = {
    findMany: jest.fn(),
    count: jest.fn()
};

jest.unstable_mockModule('../repositories/AnuncioVagaRepository.js', () => ({
    default: anuncioVagaRepositoryMock
}));

jest.unstable_mockModule('../repositories/CandidaturaRepository.js', () => ({
    default: candidaturaRepositoryMock
}));

const listTodasCandidaturasService = (await import('./ListTodasCandidaturasService.js')).default;

describe('ListTodasCandidaturasService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve listar todas as candidaturas sem filtro de vaga', async () => {
        candidaturaRepositoryMock.findMany.mockResolvedValue([
            { id: 'c1', anuncioVaga: { tituloVaga: 'Dev' } },
            { id: 'c2', anuncioVaga: { tituloVaga: 'Analista' } }
        ]);
        candidaturaRepositoryMock.count.mockResolvedValue(2);

        const resultado = await listTodasCandidaturasService.execute();

        expect(anuncioVagaRepositoryMock.findById).not.toHaveBeenCalled();
        expect(candidaturaRepositoryMock.findMany).toHaveBeenCalledWith({
            anuncioVagaId: undefined,
            status: undefined,
            incluirDescartadas: false,
            reativados: false,
            ordenacao: 'RECENTES',
            excluirReativadosSemVaga: true,
            excluirComCadastroAtivo: true
        });
        expect(resultado.totalCandidaturas).toBe(2);
        expect(resultado.candidaturas).toHaveLength(2);
    });

    it('deve listar candidaturas filtradas por vaga', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            tituloVaga: 'Analista',
            status: 'ATIVA'
        });
        candidaturaRepositoryMock.findMany.mockResolvedValue([{ id: 'c1' }]);
        candidaturaRepositoryMock.count.mockResolvedValue(1);

        const resultado = await listTodasCandidaturasService.execute({ anuncioVagaId: 'v1' });

        expect(anuncioVagaRepositoryMock.findById).toHaveBeenCalledWith('v1');
        expect(candidaturaRepositoryMock.findMany).toHaveBeenCalledWith({
            anuncioVagaId: 'v1',
            status: undefined,
            incluirDescartadas: false,
            reativados: false,
            ordenacao: 'RECENTES',
            excluirReativadosSemVaga: true,
            excluirComCadastroAtivo: true
        });
        expect(resultado.totalFiltrado).toBe(1);
    });

    it('deve listar candidaturas ordenadas pelos mais antigos', async () => {
        candidaturaRepositoryMock.findMany.mockResolvedValue([{ id: 'c1' }]);
        candidaturaRepositoryMock.count.mockResolvedValue(1);

        await listTodasCandidaturasService.execute({
            ordenacao: 'ANTIGOS',
            dataInicio: '2026-01-01',
            dataFim: '2026-12-31'
        });

        expect(candidaturaRepositoryMock.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                ordenacao: 'ANTIGOS',
                dataInicio: expect.any(Date),
                dataFim: expect.any(Date)
            })
        );
    });

    it('deve listar candidaturas reativadas sem vaga ativa', async () => {
        candidaturaRepositoryMock.findMany.mockResolvedValue([{ id: 'c1', reativadoEm: '2026-01-01' }]);
        candidaturaRepositoryMock.count.mockResolvedValue(1);

        const resultado = await listTodasCandidaturasService.execute({ reativados: true });

        expect(candidaturaRepositoryMock.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                reativados: true,
                excluirComCadastroAtivo: true
            })
        );
        expect(candidaturaRepositoryMock.count).toHaveBeenCalledWith(
            expect.objectContaining({
                reativados: true,
                excluirComCadastroAtivo: true
            })
        );
        expect(resultado.candidaturas).toHaveLength(1);
    });

    it('deve ignorar filtro de vaga vazio ou apenas espacos', async () => {
        candidaturaRepositoryMock.findMany.mockResolvedValue([]);
        candidaturaRepositoryMock.count.mockResolvedValue(0);

        await listTodasCandidaturasService.execute({ anuncioVagaId: '   ' });

        expect(anuncioVagaRepositoryMock.findById).not.toHaveBeenCalled();
        expect(candidaturaRepositoryMock.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ anuncioVagaId: undefined })
        );
    });

    it('deve ignorar filtro de vaga quando nao for string', async () => {
        candidaturaRepositoryMock.findMany.mockResolvedValue([]);
        candidaturaRepositoryMock.count.mockResolvedValue(0);

        await listTodasCandidaturasService.execute({ anuncioVagaId: 123 });

        expect(anuncioVagaRepositoryMock.findById).not.toHaveBeenCalled();
        expect(candidaturaRepositoryMock.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ anuncioVagaId: undefined })
        );
    });

    it('deve rejeitar anuncio inexistente quando filtro de vaga informado', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue(null);

        await expect(
            listTodasCandidaturasService.execute({ anuncioVagaId: 'inexistente' })
        ).rejects.toThrow(MENSAGEM_ANUNCIO_NAO_ENCONTRADO);
    });

    it('deve retornar lista vazia para status invalido', async () => {
        const resultado = await listTodasCandidaturasService.execute({ status: 'INVALIDO' });

        expect(candidaturaRepositoryMock.findMany).not.toHaveBeenCalled();
        expect(resultado.candidaturas).toEqual([]);
        expect(resultado.totalCandidaturas).toBe(0);
    });
});
