import { jest } from '@jest/globals';
import {
    MENSAGEM_ANUNCIO_NAO_ATIVO,
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    MENSAGEM_EMAIL_INVALIDO,
    MENSAGEM_EMAIL_OBRIGATORIO,
    STATUS_ANUNCIO_VAGA
} from '../constants/recrutamentoConstantes.js';

const anuncioVagaRepositoryMock = { findById: jest.fn() };
const candidaturaRepositoryMock = { create: jest.fn() };

jest.unstable_mockModule('../repositories/AnuncioVagaRepository.js', () => ({
    default: anuncioVagaRepositoryMock
}));

jest.unstable_mockModule('../repositories/CandidaturaRepository.js', () => ({
    default: candidaturaRepositoryMock
}));

const createCandidaturaService = (await import('./CreateCandidaturaService.js')).default;

const arquivoPdfMock = {
    buffer: Buffer.from('pdf'),
    mimetype: 'application/pdf',
    originalname: 'curriculo.pdf',
    size: 100
};

describe('CreateCandidaturaService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar candidatura quando anuncio esta ativo', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });
        candidaturaRepositoryMock.create.mockResolvedValue({ id: 'c1' });

        const resultado = await createCandidaturaService.execute(
            'v1',
            {
                nomeCompleto: 'Maria',
                email: 'maria@email.com',
                telefone: '11999999999',
                cidade: 'SP',
                estado: 'SP'
            },
            arquivoPdfMock
        );

        expect(candidaturaRepositoryMock.create).toHaveBeenCalled();
        expect(resultado).toEqual({ id: 'c1' });
    });

    it('deve rejeitar anuncio inativo', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.INATIVA
        });

        await expect(
            createCandidaturaService.execute('v1', { email: 'a@b.com' }, arquivoPdfMock)
        ).rejects.toThrow(MENSAGEM_ANUNCIO_NAO_ATIVO);
    });

    it('deve rejeitar email vazio', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });

        await expect(
            createCandidaturaService.execute(
                'v1',
                { nomeCompleto: 'A', telefone: '1', cidade: 'C', estado: 'SP' },
                arquivoPdfMock
            )
        ).rejects.toThrow(MENSAGEM_EMAIL_OBRIGATORIO);
    });

    it('deve rejeitar email invalido', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });

        await expect(
            createCandidaturaService.execute(
                'v1',
                {
                    nomeCompleto: 'Maria',
                    email: 'invalido',
                    telefone: '11999999999',
                    cidade: 'SP',
                    estado: 'SP'
                },
                arquivoPdfMock
            )
        ).rejects.toThrow(MENSAGEM_EMAIL_INVALIDO);
    });

    it('deve rejeitar anuncio inexistente', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue(null);

        await expect(
            createCandidaturaService.execute('x', { email: 'a@b.com' }, arquivoPdfMock)
        ).rejects.toThrow(MENSAGEM_ANUNCIO_NAO_ENCONTRADO);
    });
});
