import { jest } from '@jest/globals';
import {
    MENSAGEM_ANUNCIO_NAO_ATIVO,
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    MENSAGEM_CANDIDATURA_DUPLICADA,
    STATUS_ANUNCIO_VAGA,
    STATUS_CANDIDATURA
} from '../constants/recrutamentoConstantes.js';

const anuncioVagaRepositoryMock = { findById: jest.fn() };
const candidaturaRepositoryMock = { findByAnuncioAndUser: jest.fn(), create: jest.fn() };
const userRepositoryMock = { findSessaoPorId: jest.fn() };

jest.unstable_mockModule('../repositories/AnuncioVagaRepository.js', () => ({
    default: anuncioVagaRepositoryMock
}));

jest.unstable_mockModule('../repositories/CandidaturaRepository.js', () => ({
    default: candidaturaRepositoryMock
}));

jest.unstable_mockModule('../../users/repositories/UserRepository.js', () => ({
    default: userRepositoryMock
}));

const createCandidaturaAutenticadaService = (
    await import('./CreateCandidaturaAutenticadaService.js')
).default;

describe('CreateCandidaturaAutenticadaService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar candidatura autenticada com status pendente', async () => {
        userRepositoryMock.findSessaoPorId.mockResolvedValue({
            id: 'u1',
            name: 'Maria',
            email: 'maria@email.com'
        });
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });
        candidaturaRepositoryMock.findByAnuncioAndUser.mockResolvedValue(null);
        candidaturaRepositoryMock.create.mockResolvedValue({ id: 'c1' });

        const resultado = await createCandidaturaAutenticadaService.execute('v1', 'u1', {
            telefone: '11999999999'
        });

        expect(candidaturaRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 'u1',
                status: STATUS_CANDIDATURA.PENDENTE,
                nomeCompleto: 'Maria',
                email: 'maria@email.com'
            })
        );
        expect(resultado).toEqual({ id: 'c1' });
    });

    it('deve rejeitar candidatura duplicada com 409', async () => {
        userRepositoryMock.findSessaoPorId.mockResolvedValue({ id: 'u1', name: 'Maria', email: 'a@b.com' });
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });
        candidaturaRepositoryMock.findByAnuncioAndUser.mockResolvedValue({ id: 'c1' });

        await expect(createCandidaturaAutenticadaService.execute('v1', 'u1')).rejects.toMatchObject({
            message: MENSAGEM_CANDIDATURA_DUPLICADA,
            statusCode: 409
        });
    });

    it('deve rejeitar usuario inexistente com 404', async () => {
        userRepositoryMock.findSessaoPorId.mockResolvedValue(null);

        await expect(createCandidaturaAutenticadaService.execute('v1', 'u1')).rejects.toMatchObject({
            message: 'Usuário não encontrado.',
            statusCode: 404
        });
    });

    it('deve rejeitar anuncio inexistente', async () => {
        userRepositoryMock.findSessaoPorId.mockResolvedValue({ id: 'u1', name: 'Maria', email: 'a@b.com' });
        anuncioVagaRepositoryMock.findById.mockResolvedValue(null);

        await expect(createCandidaturaAutenticadaService.execute('v1', 'u1')).rejects.toThrow(
            MENSAGEM_ANUNCIO_NAO_ENCONTRADO
        );
    });

    it('deve criar candidatura com campos opcionais preenchidos', async () => {
        userRepositoryMock.findSessaoPorId.mockResolvedValue({
            id: 'u1',
            name: 'Maria',
            email: 'maria@email.com'
        });
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });
        candidaturaRepositoryMock.findByAnuncioAndUser.mockResolvedValue(null);
        candidaturaRepositoryMock.create.mockResolvedValue({ id: 'c1' });

        await createCandidaturaAutenticadaService.execute('v1', 'u1', {
            telefone: ' 11999999999 ',
            cidade: ' São Paulo ',
            estado: ' SP ',
            mensagemCandidato: ' Tenho interesse '
        });

        expect(candidaturaRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                telefone: '11999999999',
                cidade: 'São Paulo',
                estado: 'SP',
                mensagemCandidato: 'Tenho interesse'
            })
        );
    });

    it('deve criar candidatura com curriculo anexado', async () => {
        userRepositoryMock.findSessaoPorId.mockResolvedValue({
            id: 'u1',
            name: 'Maria',
            email: 'maria@email.com'
        });
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });
        candidaturaRepositoryMock.findByAnuncioAndUser.mockResolvedValue(null);
        candidaturaRepositoryMock.create.mockResolvedValue({ id: 'c1' });

        const arquivo = {
            buffer: Buffer.from('%PDF-1.4 conteudo-teste'),
            originalname: 'cv.pdf',
            mimetype: 'application/pdf',
            size: 1024
        };

        await createCandidaturaAutenticadaService.execute('v1', 'u1', {}, arquivo);

        expect(candidaturaRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                curriculoConteudo: arquivo.buffer,
                curriculoNomeArquivo: 'cv.pdf',
                curriculoTipoMime: 'application/pdf',
                curriculoTamanhoBytes: 1024
            })
        );
    });

    it('deve rejeitar anuncio inativo', async () => {
        userRepositoryMock.findSessaoPorId.mockResolvedValue({ id: 'u1', name: 'Maria', email: 'a@b.com' });
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.INATIVA
        });

        await expect(createCandidaturaAutenticadaService.execute('v1', 'u1')).rejects.toThrow(
            MENSAGEM_ANUNCIO_NAO_ATIVO
        );
    });
});
