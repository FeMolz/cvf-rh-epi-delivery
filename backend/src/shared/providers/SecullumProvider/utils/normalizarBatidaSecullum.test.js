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
