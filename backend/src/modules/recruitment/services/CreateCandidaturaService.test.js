import { jest } from '@jest/globals';
import {
    MENSAGEM_ANUNCIO_NAO_ATIVO,
    MENSAGEM_ANUNCIO_NAO_ENCONTRADO,
    MENSAGEM_CANDIDATURA_EMAIL_DUPLICADA,
    MENSAGEM_EMAIL_INVALIDO,
    MENSAGEM_EMAIL_OBRIGATORIO,
    MENSAGEM_MENSAGEM_CANDIDATO_OBRIGATORIA,
    MENSAGEM_NOME_COMPLETO_OBRIGATORIO,
    MENSAGEM_PRETENSAO_SALARIAL_OBRIGATORIA,
    STATUS_ANUNCIO_VAGA
} from '../constants/recrutamentoConstantes.js';

const anuncioVagaRepositoryMock = { findById: jest.fn() };
const candidaturaRepositoryMock = {
    create: jest.fn(),
    findByAnuncioAndEmail: jest.fn()
};

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

const dadosValidos = {
    nomeCompleto: 'Maria',
    email: 'maria@email.com',
    pretensaoSalarial: '5000',
    mensagemCandidato: 'Quero contribuir com a equipe.'
};

describe('CreateCandidaturaService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        candidaturaRepositoryMock.findByAnuncioAndEmail.mockResolvedValue(null);
    });

    it('deve criar candidatura com campos obrigatorios sem curriculo', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });
        candidaturaRepositoryMock.create.mockResolvedValue({ id: 'c1' });

        const resultado = await createCandidaturaService.execute('v1', dadosValidos);

        expect(candidaturaRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                nomeCompleto: 'Maria',
                email: 'maria@email.com',
                pretensaoSalarial: '5000',
                mensagemCandidato: 'Quero contribuir com a equipe.',
                telefone: null,
                cidade: null,
                estado: null
            })
        );
        expect(candidaturaRepositoryMock.create.mock.calls[0][0].curriculoConteudo).toBeUndefined();
        expect(resultado).toEqual({ id: 'c1' });
    });

    it('deve criar candidatura com curriculo quando arquivo for enviado', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });
        candidaturaRepositoryMock.create.mockResolvedValue({ id: 'c1' });

        await createCandidaturaService.execute('v1', dadosValidos, arquivoPdfMock);

        expect(candidaturaRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                curriculoConteudo: arquivoPdfMock.buffer,
                curriculoNomeArquivo: 'curriculo.pdf',
                curriculoTipoMime: 'application/pdf',
                curriculoTamanhoBytes: 100
            })
        );
    });

    it('deve rejeitar anuncio inativo', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.INATIVA
        });

        await expect(
            createCandidaturaService.execute('v1', dadosValidos, arquivoPdfMock)
        ).rejects.toThrow(MENSAGEM_ANUNCIO_NAO_ATIVO);
    });

    it('deve rejeitar email vazio', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });

        await expect(
            createCandidaturaService.execute('v1', {
                ...dadosValidos,
                email: ''
            })
        ).rejects.toThrow(MENSAGEM_EMAIL_OBRIGATORIO);
    });

    it('deve rejeitar email invalido', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });

        await expect(
            createCandidaturaService.execute('v1', {
                ...dadosValidos,
                email: 'invalido'
            })
        ).rejects.toThrow(MENSAGEM_EMAIL_INVALIDO);
    });

    it('deve rejeitar anuncio inexistente', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue(null);

        await expect(createCandidaturaService.execute('x', dadosValidos)).rejects.toThrow(
            MENSAGEM_ANUNCIO_NAO_ENCONTRADO
        );
    });

    it('deve rejeitar nome completo vazio', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });

        await expect(
            createCandidaturaService.execute('v1', {
                ...dadosValidos,
                nomeCompleto: ''
            })
        ).rejects.toThrow(MENSAGEM_NOME_COMPLETO_OBRIGATORIO);
    });

    it('deve rejeitar pretensao salarial vazia', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });

        await expect(
            createCandidaturaService.execute('v1', {
                ...dadosValidos,
                pretensaoSalarial: ''
            })
        ).rejects.toThrow(MENSAGEM_PRETENSAO_SALARIAL_OBRIGATORIA);
    });

    it('deve rejeitar descricao do candidato vazia', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });

        await expect(
            createCandidaturaService.execute('v1', {
                ...dadosValidos,
                mensagemCandidato: ''
            })
        ).rejects.toThrow(MENSAGEM_MENSAGEM_CANDIDATO_OBRIGATORIA);
    });

    it('deve rejeitar e-mail duplicado na mesma vaga', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });
        candidaturaRepositoryMock.findByAnuncioAndEmail.mockResolvedValue({ id: 'c-existente' });

        await expect(createCandidaturaService.execute('v1', dadosValidos)).rejects.toMatchObject({
            message: MENSAGEM_CANDIDATURA_EMAIL_DUPLICADA,
            statusCode: 409
        });
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
            createCandidaturaService.execute('v1', {
                nomeCompleto: 123,
                email: true,
                pretensaoSalarial: null,
                mensagemCandidato: false
            })
        ).rejects.toThrow(MENSAGEM_NOME_COMPLETO_OBRIGATORIO);
    });

    it('deve persistir campos opcionais como null quando vazios ou invalidos', async () => {
        anuncioVagaRepositoryMock.findById.mockResolvedValue({
            id: 'v1',
            status: STATUS_ANUNCIO_VAGA.ATIVA
        });
        candidaturaRepositoryMock.create.mockResolvedValue({ id: 'c3' });

        await createCandidaturaService.execute('v1', {
            nomeCompleto: 'Maria',
            email: 'maria@email.com',
            pretensaoSalarial: '4000',
            mensagemCandidato: 'Interesse na vaga',
            telefone: '   ',
            cidade: '',
            estado: null,
            cpf: '   ',
            linkedinUrl: '',
            disponibilidadeInicio: 0
        });

        expect(candidaturaRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                telefone: null,
                cidade: null,
                estado: null,
                cpf: null,
                linkedinUrl: null,
                disponibilidadeInicio: null
            })
        );
    });
});
