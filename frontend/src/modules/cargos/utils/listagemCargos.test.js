import { describe, expect, it } from 'vitest';

import { filtrarCargos, formatarData, obterQuantidadeEpis, obterRotuloStatusCargo } from './listagemCargos.js';

describe('listagemCargos', () => {
    it('deve formatar data curta em pt-BR', () => {
        const formatado = formatarData('2024-06-15T12:00:00.000Z');

        expect(formatado).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('deve obter quantidade de EPIs do cargo', () => {
        expect(obterQuantidadeEpis({ _count: { roleEpis: 3 } })).toBe(3);
        expect(obterQuantidadeEpis({})).toBe(0);
    });

    it('deve identificar status do cargo', () => {
        expect(obterRotuloStatusCargo({})).toBe('Ativo');
        expect(obterRotuloStatusCargo({ deletedAt: '2024-01-01' })).toBe('Inativo');
    });

    it('deve filtrar cargos por nome ou descrição', () => {
        const cargos = [
            { id: '1', name: 'Operador', description: 'Linha 1', _count: { roleEpis: 2 } },
            { id: '2', name: 'Gerente', description: 'Administrativo', _count: { roleEpis: 0 } }
        ];

        expect(filtrarCargos(cargos, 'operador')).toHaveLength(1);
        expect(filtrarCargos(cargos, 'administrativo')).toHaveLength(1);
        expect(filtrarCargos(cargos, '')).toHaveLength(2);
    });
});
