import { jest } from '@jest/globals';

const epiDeliveryRepositoryMock = {
    pausarPeriodicidadePorFuncionario: jest.fn(),
    retomarPeriodicidadePorFuncionario: jest.fn()
};

jest.unstable_mockModule('../repositories/EpiDeliveryRepository.js', () => ({
    default: epiDeliveryRepositoryMock
}));

const gerenciarPeriodicidadeEpiFuncionarioService = (
    await import('./GerenciarPeriodicidadeEpiFuncionarioService.js')
).default;

describe('GerenciarPeriodicidadeEpiFuncionarioService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve pausar periodicidade ao sair de ATIVO', async () => {
        await gerenciarPeriodicidadeEpiFuncionarioService.sincronizarPorMudancaStatus(
            'ATIVO',
            'FERIAS',
            'func-1'
        );

        expect(epiDeliveryRepositoryMock.pausarPeriodicidadePorFuncionario).toHaveBeenCalledWith(
            'func-1'
        );
    });

    it('deve retomar periodicidade ao voltar para ATIVO', async () => {
        await gerenciarPeriodicidadeEpiFuncionarioService.sincronizarPorMudancaStatus(
            'FERIAS',
            'ATIVO',
            'func-1'
        );

        expect(epiDeliveryRepositoryMock.retomarPeriodicidadePorFuncionario).toHaveBeenCalledWith(
            'func-1'
        );
    });

    it('nao deve chamar repositorio quando status nao mudou', async () => {
        await gerenciarPeriodicidadeEpiFuncionarioService.sincronizarPorMudancaStatus(
            'ATIVO',
            'ATIVO',
            'func-1'
        );

        expect(epiDeliveryRepositoryMock.pausarPeriodicidadePorFuncionario).not.toHaveBeenCalled();
        expect(epiDeliveryRepositoryMock.retomarPeriodicidadePorFuncionario).not.toHaveBeenCalled();
    });

    it('nao deve chamar repositorio sem identificador do funcionario', async () => {
        await gerenciarPeriodicidadeEpiFuncionarioService.sincronizarPorMudancaStatus(
            'ATIVO',
            'FERIAS',
            ''
        );

        expect(epiDeliveryRepositoryMock.pausarPeriodicidadePorFuncionario).not.toHaveBeenCalled();
    });

    it('nao deve pausar nem retomar quando mudanca nao envolve status ATIVO', async () => {
        await gerenciarPeriodicidadeEpiFuncionarioService.sincronizarPorMudancaStatus(
            'FERIAS',
            'LICENCA_MED',
            'func-1'
        );

        expect(epiDeliveryRepositoryMock.pausarPeriodicidadePorFuncionario).not.toHaveBeenCalled();
        expect(epiDeliveryRepositoryMock.retomarPeriodicidadePorFuncionario).not.toHaveBeenCalled();
    });

    it('deve indicar periodicidade ativa somente para status ATIVO', () => {
        expect(
            gerenciarPeriodicidadeEpiFuncionarioService.funcionarioPossuiPeriodicidadeEpiAtiva('ATIVO')
        ).toBe(true);
        expect(
            gerenciarPeriodicidadeEpiFuncionarioService.funcionarioPossuiPeriodicidadeEpiAtiva('FERIAS')
        ).toBe(false);
    });
});
