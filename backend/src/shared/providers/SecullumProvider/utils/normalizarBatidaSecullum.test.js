import {
    normalizarBatidaSecullum,
    normalizarListaBatidasSecullum
} from './normalizarBatidaSecullum.js';

describe('normalizarBatidaSecullum', () => {
    it('deve mapear campos em PascalCase', () => {
        const resultado = normalizarBatidaSecullum({
            FuncionarioCpf: '123.456.789-09',
            FuncionarioPis: '12345678901',
            DataHora: '2026-05-22T08:00:00'
        });

        expect(resultado).toEqual({
            funcionarioCpf: '123.456.789-09',
            funcionarioPis: '12345678901',
            dataHora: '2026-05-22T08:00:00',
            origem: null,
            dadosBrutos: expect.any(Object)
        });
    });

    it('deve retornar null para registro inválido', () => {
        expect(normalizarBatidaSecullum(null)).toBeNull();
        expect(normalizarBatidaSecullum('texto')).toBeNull();
    });

    it('deve mapear campos alternativos em camelCase e ignorar valores vazios', () => {
        const resultado = normalizarBatidaSecullum({
            cpf: '111.222.333-44',
            pis: '12345678901',
            data: '2026-05-22',
            origem: '  ',
            hora: '08:00'
        });

        expect(resultado).toEqual({
            funcionarioCpf: '111.222.333-44',
            funcionarioPis: '12345678901',
            dataHora: '2026-05-22',
            origem: null,
            dadosBrutos: expect.any(Object)
        });
    });

    it('deve priorizar primeiro campo preenchido na lista de chaves', () => {
        const resultado = normalizarBatidaSecullum({
            FuncionarioCpf: '',
            cpf: '999.888.777-66',
            numeroPis: '98765432109',
            Data: '2026-06-01',
            Origem: 'Relógio'
        });

        expect(resultado?.funcionarioCpf).toBe('999.888.777-66');
        expect(resultado?.funcionarioPis).toBe('98765432109');
        expect(resultado?.dataHora).toBe('2026-06-01');
        expect(resultado?.origem).toBe('Relógio');
    });
});

describe('normalizarListaBatidasSecullum', () => {
    it('deve normalizar lista e ignorar itens inválidos', () => {
        const resultado = normalizarListaBatidasSecullum([
            { funcionarioCpf: '111' },
            null,
            { funcionarioPis: '222' }
        ]);

        expect(resultado).toHaveLength(2);
    });

    it('deve retornar array vazio quando resposta não é lista', () => {
        expect(normalizarListaBatidasSecullum({})).toEqual([]);
    });
});
