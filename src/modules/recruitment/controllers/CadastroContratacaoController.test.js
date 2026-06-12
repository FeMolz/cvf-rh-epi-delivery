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
});
