import { jest } from '@jest/globals';
import {
    MENSAGEM_ANUNCIO_NAO_ATIVO,
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    MENSAGEM_CIDADE_OBRIGATORIA,
    MENSAGEM_EMAIL_INVALIDO,
    MENSAGEM_EMAIL_OBRIGATORIO,
    MENSAGEM_ESTADO_OBRIGATORIO,
    MENSAGEM_NOME_COMPLETO_OBRIGATORIO,
    MENSAGEM_TELEFONE_OBRIGATORIO,
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
    buffer: Buffer.from('%PDF-1.4 conteudo-teste'),
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

    it('deve rejeitar nome completo vazio', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });

        await expect(
            createCandidaturaService.execute(
                'v1',
                { email: 'a@b.com', telefone: '1', cidade: 'C', estado: 'SP' },
                arquivoPdfMock
            )
        ).rejects.toThrow(MENSAGEM_NOME_COMPLETO_OBRIGATORIO);
    });

    it('deve rejeitar telefone vazio', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });

        await expect(
            createCandidaturaService.execute(
                'v1',
                { nomeCompleto: 'Maria', email: 'a@b.com', cidade: 'C', estado: 'SP' },
                arquivoPdfMock
            )
        ).rejects.toThrow(MENSAGEM_TELEFONE_OBRIGATORIO);
    });

    it('deve rejeitar cidade vazia', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });

        await expect(
            createCandidaturaService.execute(
                'v1',
                { nomeCompleto: 'Maria', email: 'a@b.com', telefone: '1', estado: 'SP' },
                arquivoPdfMock
            )
        ).rejects.toThrow(MENSAGEM_CIDADE_OBRIGATORIA);
    });

    it('deve rejeitar estado vazio', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });

        await expect(
            createCandidaturaService.execute(
                'v1',
                { nomeCompleto: 'Maria', email: 'a@b.com', telefone: '1', cidade: 'SP' },
                arquivoPdfMock
            )
        ).rejects.toThrow(MENSAGEM_ESTADO_OBRIGATORIO);
    });

    it('deve persistir campos opcionais informados com trim', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });
        candidaturaRepositoryMock.create.mockResolvedValue({ id: 'c2' });

        await createCandidaturaService.execute(
            'v1',
            {
                nomeCompleto: ' Maria ',
                email: ' MARIA@EMAIL.COM ',
                telefone: ' 11999999999 ',
                cidade: ' São Paulo ',
                estado: ' SP ',
                cpf: ' 529.982.247-25 ',
                linkedinUrl: ' https://linkedin.com/in/maria ',
                pretensaoSalarial: ' 5000 ',
                disponibilidadeInicio: ' imediata ',
                mensagemCandidato: ' Olá '
            },
            arquivoPdfMock
        );

        expect(candidaturaRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                nomeCompleto: 'Maria',
                email: 'maria@email.com',
                telefone: '11999999999',
                cidade: 'São Paulo',
                estado: 'SP',
                cpf: '529.982.247-25',
                linkedinUrl: 'https://linkedin.com/in/maria',
                pretensaoSalarial: '5000',
                disponibilidadeInicio: 'imediata',
                mensagemCandidato: 'Olá'
            })
        );
    });

    it('deve tratar campos obrigatorios nao-string como vazios', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });

        await expect(
            createCandidaturaService.execute(
                'v1',
                {
                    nomeCompleto: 123,
                    email: true,
                    telefone: null,
                    cidade: undefined,
                    estado: false
                },
                arquivoPdfMock
            )
        ).rejects.toThrow(MENSAGEM_NOME_COMPLETO_OBRIGATORIO);
    });

    it('deve persistir campos opcionais como null quando vazios ou invalidos', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });
        candidaturaRepositoryMock.create.mockResolvedValue({ id: 'c3' });

        await createCandidaturaService.execute(
            'v1',
            {
                nomeCompleto: 'Maria',
                email: 'maria@email.com',
                telefone: '11999999999',
                cidade: 'SP',
                estado: 'SP',
                cpf: '   ',
                linkedinUrl: '',
                pretensaoSalarial: null,
                disponibilidadeInicio: 0,
                mensagemCandidato: false
            },
            arquivoPdfMock
        );

        expect(candidaturaRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                cpf: null,
                linkedinUrl: null,
                pretensaoSalarial: null,
                disponibilidadeInicio: null,
                mensagemCandidato: null
            })
        );
    });
});
