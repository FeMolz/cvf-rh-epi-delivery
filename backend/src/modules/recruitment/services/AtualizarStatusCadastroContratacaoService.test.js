import { jest } from '@jest/globals';
import {
    MENSAGEM_CADASTRO_NAO_AGUARDA_ANALISE,
    STATUS_CADASTRO_CONTRATACAO
} from '../constants/recrutamentoConstantes.js';

const cadastroContratacaoRepositoryMock = {
    findById: jest.fn(),
    delete: jest.fn(),
    update: jest.fn()
};

const createEmployeeServiceMock = { execute: jest.fn() };

jest.unstable_mockModule('../repositories/CadastroContratacaoRepository.js', () => ({
    default: cadastroContratacaoRepositoryMock
}));

jest.unstable_mockModule('../../employees/services/CreateEmployeeService.js', () => ({
    default: createEmployeeServiceMock
}));

const atualizarStatusCadastroContratacaoService = (
    await import('./AtualizarStatusCadastroContratacaoService.js')
).default;

const cadastroCompleto = {
    id: 'cad1',
    status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH,
    name: 'Maria',
    cpf: '529.982.247-25',
    email: 'maria@email.com',
    telefone: '(11) 91234-5678',
    birthDate: new Date('1990-01-01'),
    roleId: 'r1',
    companyId: 'co1',
    setorId: 's1'
};

describe('AtualizarStatusCadastroContratacaoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve descontinuar e remover cadastro', async () => {
        cadastroContratacaoRepositoryMock.findById.mockResolvedValue(cadastroCompleto);

        const resultado = await atualizarStatusCadastroContratacaoService.execute('cad1', {
            status: 'DESCONTINUADO',
            analisadoPorUserId: 'u1'
        });

        expect(cadastroContratacaoRepositoryMock.delete).toHaveBeenCalledWith('cad1');
        expect(resultado.status).toBe(STATUS_CADASTRO_CONTRATACAO.DESCONTINUADO);
        expect(createEmployeeServiceMock.execute).not.toHaveBeenCalled();
    });

    it('deve contratar e criar funcionario ativo', async () => {
        cadastroContratacaoRepositoryMock.findById.mockResolvedValue(cadastroCompleto);
        createEmployeeServiceMock.execute.mockResolvedValue({ id: 'emp1', status: 'ATIVO' });
        cadastroContratacaoRepositoryMock.update.mockResolvedValue({
            id: 'cad1',
            status: STATUS_CADASTRO_CONTRATACAO.CONTRATADO,
            employeeId: 'emp1'
        });

        const resultado = await atualizarStatusCadastroContratacaoService.execute('cad1', {
            status: 'CONTRATADO',
            analisadoPorUserId: 'u1',
            admissionDate: '2026-06-01',
            valeTransporte: true,
            valeAlimentacao: false,
            planoSaude: true
        });

        expect(createEmployeeServiceMock.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 'ATIVO',
                roleId: 'r1',
                valeTransporte: true,
                planoSaude: true
            })
        );
        expect(resultado.status).toBe(STATUS_CADASTRO_CONTRATACAO.CONTRATADO);
    });

    it('deve rejeitar cadastro que nao aguarda analise', async () => {
        cadastroContratacaoRepositoryMock.findById.mockResolvedValue({
            ...cadastroCompleto,
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO
        });

        await expect(
            atualizarStatusCadastroContratacaoService.execute('cad1', {
                status: 'CONTRATADO',
                analisadoPorUserId: 'u1'
            })
        ).rejects.toThrow(MENSAGEM_CADASTRO_NAO_AGUARDA_ANALISE);
    });
});
