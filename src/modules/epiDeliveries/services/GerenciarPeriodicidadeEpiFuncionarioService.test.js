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

    it('deve indicar periodicidade ativa somente para status ATIVO', () => {
        expect(
            gerenciarPeriodicidadeEpiFuncionarioService.funcionarioPossuiPeriodicidadeEpiAtiva('ATIVO')
        ).toBe(true);
        expect(
            gerenciarPeriodicidadeEpiFuncionarioService.funcionarioPossuiPeriodicidadeEpiAtiva('FERIAS')
        ).toBe(false);
    });
});
