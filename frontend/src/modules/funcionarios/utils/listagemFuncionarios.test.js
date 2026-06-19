import { describe, expect, it } from 'vitest';

import {
    calcularEstatisticasFuncionarios,
    filtrarFuncionarios,
    filtrarFuncionariosPorEmpresa,
    obterClasseStatusFuncionario,
    obterIdEmpresa,
    obterNomeCargo,
    obterRotuloStatusFuncionario,
    obterVarianteStatusFuncionario
} from './listagemFuncionarios.js';

describe('listagemFuncionarios', () => {
    it('deve calcular estatisticas de funcionarios', () => {
        const funcionarios = [
            { status: 'ATIVO' },
            { status: 'FERIAS' },
            { status: 'DESLIGADO' },
            { status: 'INATIVO' }
        ];

        expect(calcularEstatisticasFuncionarios(funcionarios)).toEqual({
            total: 4,
            admitidos: 3,
            demitidosInativos: 1
        });
    });

    it('deve classificar variantes de status', () => {
        expect(obterVarianteStatusFuncionario({ status: 'ATIVO' })).toBe('ativo');
        expect(obterVarianteStatusFuncionario({ status: 'FERIAS' })).toBe('afastado');
        expect(obterVarianteStatusFuncionario({ status: 'INATIVO' })).toBe('afastado');
        expect(obterVarianteStatusFuncionario({ status: 'DESLIGADO' })).toBe('encerrado');
        expect(obterClasseStatusFuncionario({ status: 'FERIAS' })).toBe(
            'status-badge status-badge--afastado'
        );
    });

    it('deve filtrar funcionarios por termo de busca', () => {
        const funcionarios = [
            {
                name: 'Maria',
                status: 'ATIVO',
                role: { name: 'Analista' },
                company: { name: 'Empresa A' },
                setor: { nome: 'RH' }
            },
            {
                name: 'João',
                status: 'DESLIGADO',
                role: { name: 'Operador' },
                company: { name: 'Empresa B' },
                setor: { nome: 'Produção' }
            }
        ];

        expect(filtrarFuncionarios(funcionarios, 'produção')).toHaveLength(1);
        expect(obterNomeCargo(funcionarios[0])).toBe('Analista');
        expect(obterRotuloStatusFuncionario({ status: 'FERIAS' })).toBe('Férias');
    });

    it('deve filtrar funcionarios por empresa', () => {
        const funcionarios = [
            { name: 'Maria', companyId: 'emp-1' },
            { name: 'João', company: { id: 'emp-2', name: 'B' } }
        ];

        expect(obterIdEmpresa(funcionarios[1])).toBe('emp-2');
        expect(filtrarFuncionariosPorEmpresa(funcionarios, 'emp-1')).toEqual([funcionarios[0]]);
    });
});
