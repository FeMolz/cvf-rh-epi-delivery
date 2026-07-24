import { jest } from '@jest/globals';
import {
    MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO,
    MENSAGEM_CADASTRO_JA_ENVIADO,
    MENSAGEM_TOKEN_CADASTRO_INVALIDO,
    STATUS_CADASTRO_CONTRATACAO
} from '../constants/recrutamentoConstantes.js';

const cadastroContratacaoRepositoryMock = {
    findByToken: jest.fn(),
    update: jest.fn()
};

jest.unstable_mockModule('../repositories/CadastroContratacaoRepository.js', () => ({
    default: cadastroContratacaoRepositoryMock
}));

const submeterCadastroContratacaoService = (
    await import('./SubmeterCadastroContratacaoService.js')
).default;

describe('SubmeterCadastroContratacaoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve submeter cadastro para analise do RH', async () => {
        cadastroContratacaoRepositoryMock.findByToken.mockResolvedValue({
            id: 'cad1',
            createdAt: new Date(),
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO,
            roleId: 'r1',
            companyId: 'co1',
            setorId: 's1'
        });
        cadastroContratacaoRepositoryMock.update.mockResolvedValue({
            id: 'cad1',
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH
        });

        const resultado = await submeterCadastroContratacaoService.execute('token-1', {
            name: 'Maria Silva',
            cpf: '529.982.247-25',
            email: 'maria@email.com',
            telefone: '(11) 91234-5678',
            birthDate: '1990-05-10',
            nacionalidade: 'Brasileira',
            estadoCivil: 'SOLTEIRO',
            racaCor: 'PARDA',
            filiacao: 'João e Ana',
            grauInstrucao: 'SUPERIOR_COMPLETO',
            numeroCtps: '12345',
            serieCtps: '001',
            numeroDependentes: 0,
            pis: '12345678901',
            chavePix: 'maria@email.com',
            cep: '01310-100',
            logradouro: 'Av. Paulista',
            numeroEndereco: '1000',
            bairro: 'Bela Vista',
            cidade: 'São Paulo',
            estado: 'SP'
        });

        expect(cadastroContratacaoRepositoryMock.update).toHaveBeenCalledWith(
            'cad1',
            expect.objectContaining({ status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH })
        );
        expect(resultado.status).toBe(STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH);
    });

    it('deve rejeitar token vazio ou ausente', async () => {
        await expect(submeterCadastroContratacaoService.execute('  ', {})).rejects.toThrow(
            MENSAGEM_TOKEN_CADASTRO_INVALIDO
        );
        await expect(submeterCadastroContratacaoService.execute(null, {})).rejects.toThrow(
            MENSAGEM_TOKEN_CADASTRO_INVALIDO
        );
        expect(cadastroContratacaoRepositoryMock.findByToken).not.toHaveBeenCalled();
    });

    it('deve rejeitar cadastro inexistente', async () => {
        cadastroContratacaoRepositoryMock.findByToken.mockResolvedValue(null);

        await expect(submeterCadastroContratacaoService.execute('token-x', {})).rejects.toThrow(
            MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO
        );
    });

    it('deve rejeitar token expirado', async () => {
        cadastroContratacaoRepositoryMock.findByToken.mockResolvedValue({
            id: 'cad1',
            createdAt: new Date('2020-01-01'),
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO
        });

        await expect(submeterCadastroContratacaoService.execute('token-exp', {})).rejects.toThrow(
            MENSAGEM_TOKEN_CADASTRO_INVALIDO
        );
    });

    it('deve rejeitar cadastro ja enviado para analise do RH', async () => {
        cadastroContratacaoRepositoryMock.findByToken.mockResolvedValue({
            id: 'cad1',
            createdAt: new Date(),
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH
        });

        await expect(submeterCadastroContratacaoService.execute('token-1', {})).rejects.toThrow(
            MENSAGEM_CADASTRO_JA_ENVIADO
        );
    });

    it('deve rejeitar cadastro com status diferente de aguardando preenchimento', async () => {
        cadastroContratacaoRepositoryMock.findByToken.mockResolvedValue({
            id: 'cad1',
            createdAt: new Date(),
            status: STATUS_CADASTRO_CONTRATACAO.CONTRATADO
        });

        await expect(submeterCadastroContratacaoService.execute('token-1', {})).rejects.toThrow(
            MENSAGEM_CADASTRO_JA_ENVIADO
        );
    });
});
