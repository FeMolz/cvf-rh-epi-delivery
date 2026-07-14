import { describe, expect, it } from 'vitest';

import {
    calcularEstatisticasFuncionarios,
    filtrarFuncionarios,
    filtrarFuncionariosPorEmpresa,
    formatarData,
    funcionarioContratoEncerrado,
    obterClasseStatusFuncionario,
    obterIdEmpresa,
    obterNomeCargo,
    obterNomeEmpresa,
    obterNomeSetor,
    obterRotuloStatusFuncionario,
    obterVarianteStatusFuncionario
} from './listagemFuncionarios.js';

const funcionarioSemRelacionamentos = { name: 'Teste' };

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
        expect(obterVarianteStatusFuncionario({ status: 'DESCONHECIDO' })).toBe('encerrado');
        expect(obterClasseStatusFuncionario({ status: 'FERIAS' })).toBe(
            'status-badge status-badge--afastado'
        );
        expect(funcionarioContratoEncerrado({ status: 'RESCINDIDO' })).toBe(true);
        expect(obterVarianteStatusFuncionario({})).toBe('encerrado');
        expect(funcionarioContratoEncerrado({})).toBe(false);
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
        expect(filtrarFuncionarios(funcionarios, '')).toHaveLength(2);
        expect(obterNomeCargo(funcionarioSemRelacionamentos)).toBe('—');
        expect(obterNomeEmpresa(funcionarioSemRelacionamentos)).toBe('—');
        expect(obterNomeSetor(funcionarioSemRelacionamentos)).toBe('—');
        expect(obterRotuloStatusFuncionario({ status: 'FERIAS' })).toBe('Férias');
        expect(obterRotuloStatusFuncionario({ status: 'CUSTOM' })).toBe('CUSTOM');
        expect(obterRotuloStatusFuncionario({})).toBe('—');
    });

    it('deve filtrar funcionarios por empresa', () => {
        const funcionarios = [
            { name: 'Maria', companyId: 'emp-1' },
            { name: 'João', company: { id: 'emp-2', name: 'B' } },
            { name: 'Sem empresa' }
        ];

        expect(obterIdEmpresa(funcionarios[0])).toBe('emp-1');
        expect(obterIdEmpresa(funcionarios[1])).toBe('emp-2');
        expect(obterIdEmpresa(funcionarios[2])).toBe('');
        expect(filtrarFuncionariosPorEmpresa(funcionarios, 'emp-1')).toEqual([funcionarios[0]]);
        expect(filtrarFuncionariosPorEmpresa(funcionarios, '')).toEqual(funcionarios);
    });

    it('deve formatar data ou retornar traco', () => {
        expect(formatarData('')).toBe('—');
        expect(formatarData('invalido')).toBe('—');
        expect(formatarData(new Date('2024-06-15T12:00:00.000Z'))).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('deve cobrir demais status de afastamento e encerramento', () => {
        expect(obterVarianteStatusFuncionario({ status: 'LICENCA_MATERNIDADE' })).toBe('afastado');
        expect(obterVarianteStatusFuncionario({ status: 'APOSENTADO' })).toBe('encerrado');
        expect(funcionarioContratoEncerrado({ status: 'APOSENTADO' })).toBe(true);
    });
});
