import { jest } from '@jest/globals';
import { STATUS_CADASTRO_CONTRATACAO } from '../constants/recrutamentoConstantes.js';

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
            birthDate: '1990-05-10'
        });

        expect(cadastroContratacaoRepositoryMock.update).toHaveBeenCalledWith(
            'cad1',
            expect.objectContaining({ status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH })
        );
        expect(resultado.status).toBe(STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH);
    });
});
