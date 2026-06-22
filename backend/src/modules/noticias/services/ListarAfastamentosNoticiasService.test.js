import { jest } from '@jest/globals';

const noticiasRepositoryMock = {
    findFuncionariosEmAfastamentoTemporario: jest.fn()
};

jest.unstable_mockModule('../repositories/NoticiasRepository.js', () => ({
    default: noticiasRepositoryMock
}));

const listarAfastamentosNoticiasService = (
    await import('./ListarAfastamentosNoticiasService.js')
).default;

describe('ListarAfastamentosNoticiasService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve montar painel de saindo e voltando', async () => {
        noticiasRepositoryMock.findFuncionariosEmAfastamentoTemporario.mockResolvedValue([
            {
                id: '1',
                name: 'Ana',
                status: 'FERIAS',
                leaveReturnDate: new Date('2099-06-28'),
                company: { name: 'CVF' }
            }
        ]);

        const resultado = await listarAfastamentosNoticiasService.execute();

        expect(resultado.saindo).toHaveLength(1);
        expect(resultado.saindo[0].nome).toBe('Ana');
        expect(resultado.mesReferencia).toBeTruthy();
    });
});
