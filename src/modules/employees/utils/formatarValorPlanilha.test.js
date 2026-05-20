import {
    formatarBooleanoPlanilha,
    formatarDataPlanilha,
    formatarTextoPlanilha
} from './formatarValorPlanilha.js';

describe('formatarValorPlanilha', () => {
    describe('formatarDataPlanilha', () => {
        it('deve retornar string vazia para valor nulo', () => {
            expect(formatarDataPlanilha(null)).toBe('');
        });

        it('deve formatar data em dd/mm/aaaa', () => {
            expect(formatarDataPlanilha(new Date('2024-06-15T12:00:00.000Z'))).toBe('15/06/2024');
        });

        it('deve retornar string vazia para data inválida', () => {
            expect(formatarDataPlanilha('data-invalida')).toBe('');
        });
    });

    describe('formatarBooleanoPlanilha', () => {
        it('deve retornar Sim para true', () => {
            expect(formatarBooleanoPlanilha(true)).toBe('Sim');
        });

        it('deve retornar Não para false', () => {
            expect(formatarBooleanoPlanilha(false)).toBe('Não');
        });

        it('deve retornar string vazia para null', () => {
            expect(formatarBooleanoPlanilha(null)).toBe('');
        });
    });

    describe('formatarTextoPlanilha', () => {
        it('deve retornar string vazia para null e undefined', () => {
            expect(formatarTextoPlanilha(null)).toBe('');
            expect(formatarTextoPlanilha(undefined)).toBe('');
        });

        it('deve converter número para texto', () => {
            expect(formatarTextoPlanilha(42)).toBe('42');
        });
    });
});
