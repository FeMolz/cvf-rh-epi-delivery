import {
    calcularAnosTempoEmpresa,
    formatarDataAniversario,
    formatarTempoEmpresa,
    montarAniversariantesEmpresa,
    montarAniversariantesPessoais,
    obterRotuloMesReferencia
} from './calcularAniversariantes.js';

describe('calcularAniversariantes', () => {
    const referencia = new Date('2025-06-21T12:00:00.000Z');

    it('deve formatar data de aniversario em dd/mm', () => {
        expect(formatarDataAniversario('1990-03-15T00:00:00.000Z')).toBe('15/03');
    });

    it('deve calcular anos de tempo de empresa considerando dia do mes', () => {
        expect(calcularAnosTempoEmpresa('2020-06-21T00:00:00.000Z', referencia)).toBe(5);
        expect(calcularAnosTempoEmpresa('2020-06-22T00:00:00.000Z', referencia)).toBe(4);
        expect(calcularAnosTempoEmpresa('2020-07-01T00:00:00.000Z', referencia)).toBe(4);
    });

    it('deve formatar tempo de empresa', () => {
        expect(formatarTempoEmpresa(0)).toBe('Menos de 1 ano');
        expect(formatarTempoEmpresa(1)).toBe('1 ano');
        expect(formatarTempoEmpresa(3)).toBe('3 anos');
    });

    it('deve listar aniversariantes pessoais do mes com hoje no topo', () => {
        const funcionarios = [
            {
                id: '1',
                name: 'Ana',
                birthDate: '1990-06-25T00:00:00.000Z',
                company: { name: 'Empresa A' }
            },
            {
                id: '2',
                name: 'Bruno',
                birthDate: '1988-06-21T00:00:00.000Z',
                company: { name: 'Empresa B' }
            },
            {
                id: '3',
                name: 'Carla',
                birthDate: '1992-07-10T00:00:00.000Z',
                company: { name: 'Empresa C' }
            }
        ];

        const resultado = montarAniversariantesPessoais(funcionarios, referencia);

        expect(resultado).toEqual([
            {
                id: '2',
                nome: 'Bruno',
                empresa: 'Empresa B',
                dataAniversario: '21/06'
            },
            {
                id: '1',
                nome: 'Ana',
                empresa: 'Empresa A',
                dataAniversario: '25/06'
            }
        ]);
    });

    it('deve listar aniversariantes de empresa do mes com hoje no topo', () => {
        const funcionarios = [
            {
                id: '1',
                name: 'Ana',
                admissionDate: '2020-06-25T00:00:00.000Z',
                company: { name: 'Empresa A' }
            },
            {
                id: '2',
                name: 'Bruno',
                admissionDate: '2018-06-21T00:00:00.000Z',
                company: { name: 'Empresa B' }
            }
        ];

        const resultado = montarAniversariantesEmpresa(funcionarios, referencia);

        expect(resultado).toEqual([
            {
                id: '2',
                nome: 'Bruno',
                empresa: 'Empresa B',
                tempoEmpresa: '7 anos'
            },
            {
                id: '1',
                nome: 'Ana',
                empresa: 'Empresa A',
                tempoEmpresa: '4 anos'
            }
        ]);
    });

    it('deve retornar rotulo do mes de referencia', () => {
        expect(obterRotuloMesReferencia(referencia)).toMatch(/junho de 2025/i);
    });
});
