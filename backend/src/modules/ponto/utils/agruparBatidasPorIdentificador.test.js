import { agruparBatidasPorIdentificador } from './agruparBatidasPorIdentificador.js';

describe('agruparBatidasPorIdentificador', () => {
    it('deve agrupar batidas por CPF e PIS normalizados', () => {
        const batidas = [
            {
                funcionarioCpf: '123.456.789-09',
                funcionarioPis: '111.22233.44-5',
                dataHora: '2026-05-22T08:00:00'
            },
            {
                funcionarioCpf: '12345678909',
                funcionarioPis: null,
                dataHora: '2026-05-22T12:00:00'
            },
            {
                funcionarioCpf: null,
                funcionarioPis: '11122233445',
                dataHora: '2026-05-22T09:00:00'
            }
        ];

        const indice = agruparBatidasPorIdentificador(batidas);

        expect(indice.porCpf.get('12345678909')).toHaveLength(2);
        expect(indice.porPis.get('11122233445')).toHaveLength(2);
    });

    it('deve ignorar PIS inválido e batidas sem identificadores', () => {
        const batidaSemId = { funcionarioCpf: null, funcionarioPis: null };
        const batidaPisInvalido = { funcionarioCpf: null, funcionarioPis: 'abc' };

        const indice = agruparBatidasPorIdentificador([batidaSemId, batidaPisInvalido]);

        expect(indice.porCpf.size).toBe(0);
        expect(indice.porPis.size).toBe(0);
    });
});
