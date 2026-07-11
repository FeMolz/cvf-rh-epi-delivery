import {
    calcularAnosTempoEmpresa,
    formatarDataAniversario,
    formatarTempoEmpresa,
    montarAniversariantesEmpresa,
    montarAniversariantesPessoais,
    obterDiaMesUtc,
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

    it('deve priorizar dois aniversariantes de hoje por dia', () => {
        const resultado = montarAniversariantesPessoais(
            [
                {
                    id: '21',
                    name: 'Paula',
                    birthDate: '1990-06-21T00:00:00.000Z',
                    company: { name: 'Empresa V' }
                },
                {
                    id: '22',
                    name: 'Quintino',
                    birthDate: '1988-06-21T00:00:00.000Z',
                    company: { name: 'Empresa W' }
                },
                {
                    id: '23',
                    name: 'Rita',
                    birthDate: '1992-06-25T00:00:00.000Z',
                    company: { name: 'Empresa X' }
                }
            ],
            referencia
        );

        expect(resultado.map((item) => item.nome)).toEqual(['Paula', 'Quintino', 'Rita']);
    });

    it('deve tratar admissao futura como menos de um ano', () => {
        expect(calcularAnosTempoEmpresa('2026-08-01T00:00:00.000Z', referencia)).toBeLessThan(1);
        expect(formatarTempoEmpresa(calcularAnosTempoEmpresa('2026-08-01T00:00:00.000Z', referencia))).toBe(
            'Menos de 1 ano'
        );
    });

    it('deve usar traco quando empresa existir sem nome', () => {
        const resultado = montarAniversariantesPessoais(
            [
                {
                    id: '20',
                    name: 'Otavio',
                    birthDate: '1990-06-12T00:00:00.000Z',
                    company: { name: undefined }
                }
            ],
            referencia
        );

        expect(resultado[0].empresa).toBe('—');
    });

    it('deve formatar exatamente um ano de tempo de empresa', () => {
        expect(formatarTempoEmpresa(1)).toBe('1 ano');
        expect(calcularAnosTempoEmpresa('2024-06-21T00:00:00.000Z', referencia)).toBe(1);
    });

    it('deve manter anos sem decremento no aniversario exato de admissao', () => {
        expect(calcularAnosTempoEmpresa('2018-06-21T00:00:00.000Z', referencia)).toBe(7);
    });

    it('deve montar listas usando referencia padrao', () => {
        const mesAtual = new Date().getUTCMonth();
        const funcionarios = [
            {
                id: '17',
                name: 'Laura',
                birthDate: new Date(Date.UTC(1990, mesAtual, 15)).toISOString(),
                admissionDate: new Date(Date.UTC(2018, mesAtual, 15)).toISOString(),
                company: { name: 'Empresa S' }
            }
        ];

        expect(montarAniversariantesPessoais(funcionarios)).toHaveLength(1);
        expect(montarAniversariantesEmpresa(funcionarios)).toHaveLength(1);
        expect(calcularAnosTempoEmpresa(funcionarios[0].admissionDate)).toBeGreaterThanOrEqual(0);
        expect(obterRotuloMesReferencia()).toBeTruthy();
    });

    it('deve priorizar aniversariante de empresa de hoje sobre os demais', () => {
        const resultado = montarAniversariantesEmpresa(
            [
                {
                    id: '18',
                    name: 'Marcos',
                    admissionDate: '2020-06-28T00:00:00.000Z',
                    company: { name: 'Empresa T' }
                },
                {
                    id: '19',
                    name: 'Nina',
                    admissionDate: '2018-06-21T00:00:00.000Z',
                    company: { name: 'Empresa U' }
                }
            ],
            referencia
        );

        expect(resultado[0].nome).toBe('Nina');
    });

    it('deve decrementar anos quando mes de referencia for anterior ao mes de admissao', () => {
        expect(calcularAnosTempoEmpresa('2020-08-01T00:00:00.000Z', referencia)).toBe(4);
    });

    it('deve priorizar aniversariante pessoal de hoje sobre os demais', () => {
        const resultado = montarAniversariantesPessoais(
            [
                {
                    id: '15',
                    name: 'Joao',
                    birthDate: '1990-06-30T00:00:00.000Z',
                    company: { name: 'Empresa Q' }
                },
                {
                    id: '16',
                    name: 'Kelly',
                    birthDate: '1988-06-21T00:00:00.000Z',
                    company: { name: 'Empresa R' }
                }
            ],
            referencia
        );

        expect(resultado[0].nome).toBe('Kelly');
        expect(resultado[1].nome).toBe('Joao');
    });

    it('deve ordenar aniversariantes de empresa por dia quando ninguem completa tempo hoje', () => {
        const resultado = montarAniversariantesEmpresa(
            [
                {
                    id: '12',
                    name: 'Gabi',
                    admissionDate: '2020-06-28T00:00:00.000Z',
                    company: { name: 'Empresa Y' }
                },
                {
                    id: '13',
                    name: 'Hugo',
                    admissionDate: '2019-06-15T00:00:00.000Z',
                    company: { name: 'Empresa Z' }
                }
            ],
            new Date('2025-06-10T12:00:00.000Z')
        );

        expect(resultado.map((item) => item.nome)).toEqual(['Hugo', 'Gabi']);
    });

    it('deve ignorar funcionarios fora do mes de referencia', () => {
        const resultado = montarAniversariantesPessoais(
            [
                {
                    id: '14',
                    name: 'Ivo',
                    birthDate: '1990-08-01T00:00:00.000Z',
                    company: { name: 'Empresa W' }
                }
            ],
            referencia
        );

        expect(resultado).toEqual([]);
    });

    it('deve extrair dia e mes em UTC', () => {
        expect(obterDiaMesUtc('1990-03-15T00:00:00.000Z')).toEqual({ dia: 15, mes: 2 });
        expect(obterDiaMesUtc(new Date('1990-03-15T00:00:00.000Z'))).toEqual({ dia: 15, mes: 2 });
    });

    it('deve formatar data de aniversario com instancia Date', () => {
        expect(formatarDataAniversario(new Date('1990-03-15T00:00:00.000Z'))).toBe('15/03');
    });

    it('deve usar traco quando empresa estiver ausente', () => {
        const resultado = montarAniversariantesPessoais(
            [
                {
                    id: '9',
                    name: 'Diego',
                    birthDate: '1990-06-10T00:00:00.000Z'
                }
            ],
            referencia
        );

        expect(resultado[0].empresa).toBe('—');
    });

    it('deve priorizar aniversario de empresa de hoje e usar traco sem empresa', () => {
        const resultado = montarAniversariantesEmpresa(
            [
                {
                    id: '10',
                    name: 'Eva',
                    admissionDate: '2020-06-21T00:00:00.000Z'
                },
                {
                    id: '11',
                    name: 'Fabio',
                    admissionDate: '2019-06-25T00:00:00.000Z',
                    company: { name: 'Empresa X' }
                }
            ],
            referencia
        );

        expect(resultado[0].nome).toBe('Eva');
        expect(resultado[0].empresa).toBe('—');
    });

    it('deve ordenar por dia quando ninguem faz aniversario hoje', () => {
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
                birthDate: '1988-06-22T00:00:00.000Z',
                company: { name: 'Empresa B' }
            }
        ];

        const resultado = montarAniversariantesPessoais(funcionarios, new Date('2025-06-10T12:00:00.000Z'));

        expect(resultado.map((item) => item.nome)).toEqual(['Bruno', 'Ana']);
    });

    it('deve calcular anos com admissionDate como Date', () => {
        expect(calcularAnosTempoEmpresa(new Date('2020-05-01T00:00:00.000Z'), referencia)).toBe(5);
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
