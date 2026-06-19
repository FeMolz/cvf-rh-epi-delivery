import { jest } from '@jest/globals';
import { MENSAGEM_TITULO_VAGA_OBRIGATORIO } from '../constants/recrutamentoConstantes.js';

const anuncioVagaRepositoryMock = {
    create: jest.fn()
};

jest.unstable_mockModule('../repositories/AnuncioVagaRepository.js', () => ({
    default: anuncioVagaRepositoryMock
}));

const createAnuncioVagaService = (await import('./CreateAnuncioVagaService.js')).default;

describe('CreateAnuncioVagaService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar anuncio com campos validos', async () => {
        const anuncioCriado = { id: '1', tituloVaga: 'Dev' };
        anuncioVagaRepositoryMock.create.mockResolvedValue(anuncioCriado);

        const resultado = await createAnuncioVagaService.execute({
            tituloVaga: ' Dev ',
            apresentacaoEmpresa: 'Empresa X',
            sobreVaga: 'Sobre',
            responsabilidades: 'Resp',
            requisitos: 'Req',
            beneficios: 'Ben',
            localTrabalho: 'SP',
            tipoContratacao: 'clt',
            jornadaTrabalho: '40h',
            roleId: 'role-1',
            companyId: 'comp-1',
            setorId: 'setor-1',
            criadoPorUserId: 'user-1'
        });

        expect(anuncioVagaRepositoryMock.create).toHaveBeenCalled();
        expect(resultado).toEqual(anuncioCriado);
    });

    it('deve rejeitar titulo vazio', async () => {
        await expect(
            createAnuncioVagaService.execute({
                tituloVaga: '',
                apresentacaoEmpresa: 'E',
                sobreVaga: 'S',
                responsabilidades: 'R',
                requisitos: 'R',
                beneficios: 'B',
                localTrabalho: 'L',
                tipoContratacao: 'CLT',
                jornadaTrabalho: '8h',
                criadoPorUserId: 'u1'
            })
        ).rejects.toThrow(MENSAGEM_TITULO_VAGA_OBRIGATORIO);
    });
});
