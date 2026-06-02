import { jest } from '@jest/globals';
import { STATUS_CADASTRO_CONTRATACAO } from '../constants/recrutamentoConstantes.js';

const cadastroContratacaoRepositoryMock = { findMany: jest.fn() };

jest.unstable_mockModule('../repositories/CadastroContratacaoRepository.js', () => ({
    default: cadastroContratacaoRepositoryMock
}));

const listCadastrosContratacaoService = (await import('./ListCadastrosContratacaoService.js')).default;

describe('ListCadastrosContratacaoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve listar cadastros com filtro de status valido', async () => {
        const lista = [{ id: 'cad1', status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH }];
        cadastroContratacaoRepositoryMock.findMany.mockResolvedValue(lista);

        const resultado = await listCadastrosContratacaoService.execute({
            status: ' aguardando_analise_rh '
        });

        expect(cadastroContratacaoRepositoryMock.findMany).toHaveBeenCalledWith({
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH
        });
        expect(resultado).toEqual(lista);
    });

    it('deve retornar lista vazia para status invalido', async () => {
        const resultado = await listCadastrosContratacaoService.execute({ status: 'INVALIDO' });

        expect(cadastroContratacaoRepositoryMock.findMany).not.toHaveBeenCalled();
        expect(resultado).toEqual([]);
    });
});
