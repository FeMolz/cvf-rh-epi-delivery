import { jest } from '@jest/globals';
import {
    MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO,
    MENSAGEM_CONVITE_CADASTRO_JA_EXISTE
} from '../constants/recrutamentoConstantes.js';

const gerarConviteMock = { execute: jest.fn() };
const getPublicoMock = { execute: jest.fn() };
const submeterPublicoMock = { execute: jest.fn() };
const listMock = { execute: jest.fn() };
const getByIdMock = { execute: jest.fn() };
const atualizarStatusMock = { execute: jest.fn() };

jest.unstable_mockModule('../services/GerarConviteCadastroContratacaoService.js', () => ({
    default: gerarConviteMock
}));
jest.unstable_mockModule('../services/GetCadastroContratacaoPublicoService.js', () => ({
    default: getPublicoMock
}));
jest.unstable_mockModule('../services/SubmeterCadastroContratacaoService.js', () => ({
    default: submeterPublicoMock
}));
jest.unstable_mockModule('../services/ListCadastrosContratacaoService.js', () => ({
    default: listMock
}));
jest.unstable_mockModule('../services/GetCadastroContratacaoService.js', () => ({
    default: getByIdMock
}));
jest.unstable_mockModule('../services/AtualizarStatusCadastroContratacaoService.js', () => ({
    default: atualizarStatusMock
}));

const cadastroContratacaoController = (await import('./CadastroContratacaoController.js')).default;

function criarMocksResposta() {
    return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

function criarErroHttpTeste(mensagem, statusCode) {
    const erro = new Error(mensagem);
    erro.statusCode = statusCode;
    return erro;
}

describe('CadastroContratacaoController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('gerarConvite deve retornar 201', async () => {
        gerarConviteMock.execute.mockResolvedValue({ id: 'cad1', urlCadastro: '/link' });
        const resposta = criarMocksResposta();

        await cadastroContratacaoController.gerarConvite({ params: { id: 'c1' } }, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(201);
    });

    it('gerarConvite deve encaminhar 400 ao next para convite duplicado', async () => {
        gerarConviteMock.execute.mockRejectedValue(
            criarErroHttpTeste(MENSAGEM_CONVITE_CADASTRO_JA_EXISTE, 400)
        );
        const proximo = jest.fn();

        await cadastroContratacaoController.gerarConvite(
            { params: { id: 'c1' } },
            criarMocksResposta(),
            proximo
        );

        expect(proximo).toHaveBeenCalledWith(
            expect.objectContaining({ message: MENSAGEM_CONVITE_CADASTRO_JA_EXISTE, statusCode: 400 })
        );
    });

    it('getById deve retornar 200', async () => {
        getByIdMock.execute.mockResolvedValue({ id: 'cad1' });
        const resposta = criarMocksResposta();

        await cadastroContratacaoController.getById({ params: { id: 'cad1' } }, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(200);
        expect(resposta.json).toHaveBeenCalledWith({ id: 'cad1' });
    });

    it('getById deve encaminhar 404 ao next quando nao encontrado', async () => {
        getByIdMock.execute.mockRejectedValue(
            criarErroHttpTeste(MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO, 404)
        );
        const proximo = jest.fn();

        await cadastroContratacaoController.getById({ params: { id: 'x' } }, criarMocksResposta(), proximo);

        expect(proximo).toHaveBeenCalledWith(
            expect.objectContaining({
                message: MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO,
                statusCode: 404
            })
        );
    });

    it('atualizarStatus deve repassar user id ao servico', async () => {
        atualizarStatusMock.execute.mockResolvedValue({ id: 'cad1', status: 'CONTRATADO' });
        const resposta = criarMocksResposta();

        await cadastroContratacaoController.atualizarStatus(
            { params: { id: 'cad1' }, body: { status: 'CONTRATADO' }, user: { id: 'u1' } },
            resposta,
            jest.fn()
        );

        expect(atualizarStatusMock.execute).toHaveBeenCalledWith('cad1', {
            status: 'CONTRATADO',
            analisadoPorUserId: 'u1'
        });
    });

    it('getPublico deve retornar 200', async () => {
        getPublicoMock.execute.mockResolvedValue({ id: 'cad1' });
        const resposta = criarMocksResposta();

        await cadastroContratacaoController.getPublico({ params: { token: 'tok' } }, resposta, jest.fn());

        expect(resposta.status).toHaveBeenCalledWith(200);
    });

    it('getPublico deve encaminhar erro ao next', async () => {
        const erro = criarErroHttpTeste('token invalido', 404);
        getPublicoMock.execute.mockRejectedValue(erro);
        const proximo = jest.fn();

        await cadastroContratacaoController.getPublico(
            { params: { token: 'x' } },
            criarMocksResposta(),
            proximo
        );

        expect(proximo).toHaveBeenCalledWith(erro);
    });

    it('submeterPublico deve retornar 200', async () => {
        submeterPublicoMock.execute.mockResolvedValue({ id: 'cad1' });
        const resposta = criarMocksResposta();

        await cadastroContratacaoController.submeterPublico(
            { params: { token: 'tok' }, body: { name: 'Joao' } },
            resposta,
            jest.fn()
        );

        expect(submeterPublicoMock.execute).toHaveBeenCalledWith('tok', { name: 'Joao' });
        expect(resposta.status).toHaveBeenCalledWith(200);
    });

    it('submeterPublico deve encaminhar erro ao next', async () => {
        const erro = criarErroHttpTeste('dados invalidos', 400);
        submeterPublicoMock.execute.mockRejectedValue(erro);
        const proximo = jest.fn();

        await cadastroContratacaoController.submeterPublico(
            { params: { token: 'tok' }, body: {} },
            criarMocksResposta(),
            proximo
        );

        expect(proximo).toHaveBeenCalledWith(erro);
    });

    it('list deve retornar 200', async () => {
        listMock.execute.mockResolvedValue([]);
        const resposta = criarMocksResposta();

        await cadastroContratacaoController.list({ query: { status: 'PENDENTE' } }, resposta, jest.fn());

        expect(listMock.execute).toHaveBeenCalledWith({ status: 'PENDENTE' });
        expect(resposta.status).toHaveBeenCalledWith(200);
    });

    it('list deve encaminhar erro ao next', async () => {
        const erro = new Error('falha listagem');
        listMock.execute.mockRejectedValue(erro);
        const proximo = jest.fn();

        await cadastroContratacaoController.list({ query: {} }, criarMocksResposta(), proximo);

        expect(proximo).toHaveBeenCalledWith(erro);
    });

    it('atualizarStatus deve usar corpo vazio quando body invalido', async () => {
        atualizarStatusMock.execute.mockResolvedValue({ id: 'cad1' });
        const resposta = criarMocksResposta();

        await cadastroContratacaoController.atualizarStatus(
            { params: { id: 'cad1' }, body: null, user: { id: 'u1' } },
            resposta,
            jest.fn()
        );

        expect(atualizarStatusMock.execute).toHaveBeenCalledWith('cad1', {
            analisadoPorUserId: 'u1'
        });
    });

    it('atualizarStatus deve encaminhar erro ao next', async () => {
        const erro = criarErroHttpTeste('status invalido', 400);
        atualizarStatusMock.execute.mockRejectedValue(erro);
        const proximo = jest.fn();

        await cadastroContratacaoController.atualizarStatus(
            { params: { id: 'cad1' }, body: {}, user: { id: 'u1' } },
            criarMocksResposta(),
            proximo
        );

        expect(proximo).toHaveBeenCalledWith(erro);
    });
});
