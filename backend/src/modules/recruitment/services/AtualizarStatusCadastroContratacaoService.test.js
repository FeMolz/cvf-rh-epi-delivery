import { jest } from '@jest/globals';
import {
    MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO,
    MENSAGEM_CADASTRO_NAO_AGUARDA_ANALISE,
    MENSAGEM_CADASTRO_NAO_PODE_CANCELAR,
    MENSAGEM_CAMPOS_FUNCIONARIO_OBRIGATORIOS_CADASTRO,
    MENSAGEM_STATUS_CADASTRO_INVALIDO,
    STATUS_CADASTRO_CONTRATACAO,
    STATUS_CANDIDATURA
} from '../constants/recrutamentoConstantes.js';

const cadastroContratacaoRepositoryMock = {
    findById: jest.fn(),
    delete: jest.fn(),
    update: jest.fn()
};

const candidaturaRepositoryMock = {
    update: jest.fn()
};

const createEmployeeServiceMock = { execute: jest.fn() };

jest.unstable_mockModule('../repositories/CadastroContratacaoRepository.js', () => ({
    default: cadastroContratacaoRepositoryMock
}));

jest.unstable_mockModule('../repositories/CandidaturaRepository.js', () => ({
    default: candidaturaRepositoryMock
}));

jest.unstable_mockModule('../../employees/services/CreateEmployeeService.js', () => ({
    default: createEmployeeServiceMock
}));

const atualizarStatusCadastroContratacaoService = (
    await import('./AtualizarStatusCadastroContratacaoService.js')
).default;

const cadastroCompleto = {
    id: 'cad1',
    candidaturaId: 'c1',
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

    it('deve cancelar processo, descartar candidatura e remover cadastro', async () => {
        cadastroContratacaoRepositoryMock.findById.mockResolvedValue(cadastroCompleto);
        candidaturaRepositoryMock.update.mockResolvedValue({
            id: 'c1',
            status: STATUS_CANDIDATURA.DESCARTADO
        });

        const resultado = await atualizarStatusCadastroContratacaoService.execute('cad1', {
            status: 'DESCONTINUADO',
            analisadoPorUserId: 'u1'
        });

        expect(candidaturaRepositoryMock.update).toHaveBeenCalledWith('c1', {
            status: STATUS_CANDIDATURA.DESCARTADO,
            descartadoEm: expect.any(Date)
        });
        expect(cadastroContratacaoRepositoryMock.delete).toHaveBeenCalledWith('cad1');
        expect(resultado.status).toBe(STATUS_CADASTRO_CONTRATACAO.DESCONTINUADO);
        expect(createEmployeeServiceMock.execute).not.toHaveBeenCalled();
    });

    it('deve cancelar processo ainda aguardando preenchimento', async () => {
        cadastroContratacaoRepositoryMock.findById.mockResolvedValue({
            ...cadastroCompleto,
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO
        });

        await atualizarStatusCadastroContratacaoService.execute('cad1', {
            status: 'DESCONTINUADO',
            analisadoPorUserId: 'u1'
        });

        expect(candidaturaRepositoryMock.update).toHaveBeenCalledWith(
            'c1',
            expect.objectContaining({ status: STATUS_CANDIDATURA.DESCARTADO })
        );
        expect(cadastroContratacaoRepositoryMock.delete).toHaveBeenCalledWith('cad1');
    });

    it('deve rejeitar cancelamento fora do processo de aprovacao', async () => {
        cadastroContratacaoRepositoryMock.findById.mockResolvedValue({
            ...cadastroCompleto,
            status: STATUS_CADASTRO_CONTRATACAO.CONTRATADO
        });

        await expect(
            atualizarStatusCadastroContratacaoService.execute('cad1', {
                status: 'DESCONTINUADO',
                analisadoPorUserId: 'u1'
            })
        ).rejects.toThrow(MENSAGEM_CADASTRO_NAO_PODE_CANCELAR);
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

    it('deve cancelar processo sem descartar candidatura quando cadastro nao tem candidaturaId', async () => {
        cadastroContratacaoRepositoryMock.findById.mockResolvedValue({
            ...cadastroCompleto,
            candidaturaId: null,
            status: STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO
        });

        const resultado = await atualizarStatusCadastroContratacaoService.execute('cad1', {
            status: 'DESCONTINUADO',
            analisadoPorUserId: 'u1'
        });

        expect(candidaturaRepositoryMock.update).not.toHaveBeenCalled();
        expect(cadastroContratacaoRepositoryMock.delete).toHaveBeenCalledWith('cad1');
        expect(resultado.status).toBe(STATUS_CADASTRO_CONTRATACAO.DESCONTINUADO);
    });

    it('deve rejeitar status invalido', async () => {
        await expect(
            atualizarStatusCadastroContratacaoService.execute('cad1', {
                status: 'PENDENTE',
                analisadoPorUserId: 'u1'
            })
        ).rejects.toThrow(MENSAGEM_STATUS_CADASTRO_INVALIDO);

        await expect(
            atualizarStatusCadastroContratacaoService.execute('cad1', {
                status: 123,
                analisadoPorUserId: 'u1'
            })
        ).rejects.toThrow(MENSAGEM_STATUS_CADASTRO_INVALIDO);
    });

    it('deve rejeitar cadastro inexistente', async () => {
        cadastroContratacaoRepositoryMock.findById.mockResolvedValue(null);

        await expect(
            atualizarStatusCadastroContratacaoService.execute('cad-x', {
                status: 'CONTRATADO',
                analisadoPorUserId: 'u1'
            })
        ).rejects.toThrow(MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO);
    });

    it('deve rejeitar contratacao quando campos obrigatorios do funcionario estao ausentes', async () => {
        cadastroContratacaoRepositoryMock.findById.mockResolvedValue({
            ...cadastroCompleto,
            name: null
        });

        await expect(
            atualizarStatusCadastroContratacaoService.execute('cad1', {
                status: 'CONTRATADO',
                analisadoPorUserId: 'u1',
                admissionDate: '2026-06-01'
            })
        ).rejects.toThrow(MENSAGEM_CAMPOS_FUNCIONARIO_OBRIGATORIOS_CADASTRO);
    });
});
