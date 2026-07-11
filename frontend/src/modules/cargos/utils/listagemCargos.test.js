import { describe, expect, it } from 'vitest';

import {
    cargoPodeSerDesativado,
    filtrarCargos,
    formatarData,
    obterClasseStatusCargo,
    obterQuantidadeEpis,
    obterQuantidadeFuncionarios,
    obterRotuloStatusCargo
} from './listagemCargos.js';

describe('listagemCargos', () => {
    it('deve formatar data curta em pt-BR', () => {
        const formatado = formatarData('2024-06-15T12:00:00.000Z');

        expect(formatado).toMatch(/\d{2}\/\d{2}\/\d{4}/);
        expect(formatarData('')).toBe('—');
        expect(formatarData('invalido')).toBe('—');
        expect(formatarData(new Date('2024-06-15T12:00:00.000Z'))).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('deve obter quantidade de EPIs do cargo', () => {
        expect(obterQuantidadeEpis({ _count: { roleEpis: 3 } })).toBe(3);
        expect(obterQuantidadeEpis({})).toBe(0);
    });

    it('deve identificar status do cargo', () => {
        expect(obterRotuloStatusCargo({})).toBe('Ativo');
        expect(obterRotuloStatusCargo({ deletedAt: '2024-01-01' })).toBe('Inativo');
        expect(obterClasseStatusCargo({})).toContain('status-badge--ativo');
        expect(obterClasseStatusCargo({ deletedAt: '2024-01-01' })).toContain('status-badge--offline');
    });

    it('deve obter quantidade de funcionarios e regra de desativacao', () => {
        const cargoComFuncionarios = { _count: { employees: 2 } };
        const cargoSemFuncionarios = { _count: { employees: 0 } };

        expect(obterQuantidadeFuncionarios(cargoComFuncionarios)).toBe(2);
        expect(obterQuantidadeFuncionarios({})).toBe(0);
        expect(cargoPodeSerDesativado(cargoComFuncionarios)).toBe(false);
        expect(cargoPodeSerDesativado(cargoSemFuncionarios)).toBe(true);
        expect(cargoPodeSerDesativado({ deletedAt: '2024-01-01', _count: { employees: 0 } })).toBe(false);
    });

    it('deve filtrar cargos por nome ou descrição', () => {
        const cargos = [
            { id: '1', name: 'Operador', description: 'Linha 1', _count: { roleEpis: 2 } },
            { id: '2', name: 'Gerente', description: 'Administrativo', _count: { roleEpis: 0 } }
        ];

        expect(filtrarCargos(cargos, 'operador')).toHaveLength(1);
        expect(filtrarCargos(cargos, 'administrativo')).toHaveLength(1);
        expect(filtrarCargos(cargos, '')).toHaveLength(2);
        expect(filtrarCargos(cargos, '2')).toHaveLength(1);
    });

    it('deve tratar cargo nulo como inativo', () => {
        expect(obterRotuloStatusCargo(null)).toBe('Inativo');
        expect(obterClasseStatusCargo(null)).toContain('offline');
        expect(obterRotuloStatusCargo(undefined)).toBe('Inativo');
    });

    it('deve filtrar cargos por status e quantidade de epis', () => {
        const cargos = [
            { id: '1', name: 'Operador', description: 'Linha 1', _count: { roleEpis: 2 } },
            { id: '2', name: 'Gerente', description: 'Administrativo', deletedAt: '2024-01-01' }
        ];

        expect(filtrarCargos(cargos, 'inativo')).toHaveLength(1);
        expect(filtrarCargos(cargos, 'linha 1')).toHaveLength(1);
    });
});
