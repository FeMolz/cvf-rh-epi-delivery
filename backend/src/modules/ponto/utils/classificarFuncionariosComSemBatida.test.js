import { agruparBatidasPorIdentificador } from './agruparBatidasPorIdentificador.js';
import { classificarFuncionariosComSemBatida } from './classificarFuncionariosComSemBatida.js';

describe('classificarFuncionariosComSemBatida', () => {
    const funcionarios = [
        { id: '1', name: 'Ana', cpf: '123.456.789-09', pis: '11111111111' },
        { id: '2', name: 'Bruno', cpf: '987.654.321-00', pis: null }
    ];

    it('deve unificar batidas por cpf e pis sem duplicar', () => {
        const batidas = [
            {
                funcionarioCpf: null,
                funcionarioPis: '11111111111',
                dataHora: '2026-05-22T08:00:00',
                origem: 'REP',
                dadosBrutos: { id: 1 }
            },
            {
                funcionarioCpf: '123.456.789-09',
                funcionarioPis: '11111111111',
                dataHora: '2026-05-22T08:00:00',
                origem: 'REP',
                dadosBrutos: { id: 1 }
            },
            {
                funcionarioCpf: '123.456.789-09',
                funcionarioPis: null,
                dataHora: '2026-05-22T12:00:00',
                origem: 'APP',
                dadosBrutos: { id: 2 }
            }
        ];

        const indice = agruparBatidasPorIdentificador(batidas);
        const resultado = classificarFuncionariosComSemBatida(funcionarios, indice);

        expect(resultado.comBatida[0].quantidadeBatidas).toBe(2);
        expect(resultado.comBatida[0].batidas).toHaveLength(2);
    });

    it('deve separar funcionários com e sem batida', () => {
        const batidas = [
            {
                funcionarioCpf: '123.456.789-09',
                funcionarioPis: null,
                dataHora: '2026-05-22T08:00:00',
                origem: 'APP',
                dadosBrutos: { id: 1 }
            }
        ];

        const indice = agruparBatidasPorIdentificador(batidas);
        const resultado = classificarFuncionariosComSemBatida(funcionarios, indice);

        expect(resultado.comBatida).toHaveLength(1);
        expect(resultado.comBatida[0].employeeId).toBe('1');
        expect(resultado.comBatida[0].quantidadeBatidas).toBe(1);
        expect(resultado.semBatida).toHaveLength(1);
        expect(resultado.semBatida[0].employeeId).toBe('2');
    });
});
