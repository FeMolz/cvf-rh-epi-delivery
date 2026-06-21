import { describe, expect, it } from 'vitest';

import {
    filtrarSetores,
    filtrarSetoresPorSituacao,
    obterClasseStatusSetor,
    obterRotuloStatusSetor,
    setorEstaAtivo
} from './listagemSetores.js';

describe('listagemSetores', () => {
    const setores = [
        { id: '1', nome: 'TI', isActive: true },
        { id: '2', nome: 'RH', isActive: false }
    ];

    it('deve identificar setor ativo', () => {
        expect(setorEstaAtivo(setores[0])).toBe(true);
        expect(setorEstaAtivo(setores[1])).toBe(false);
    });

    it('deve filtrar por situação', () => {
        expect(filtrarSetoresPorSituacao(setores, false)).toHaveLength(1);
        expect(filtrarSetoresPorSituacao(setores, true)).toHaveLength(1);
    });

    it('deve filtrar por termo de busca', () => {
        expect(filtrarSetores(setores, 'rh')).toHaveLength(1);
    });

    it('deve retornar rótulo de status', () => {
        expect(obterRotuloStatusSetor(setores[0])).toBe('Ativo');
        expect(obterRotuloStatusSetor(setores[1])).toBe('Inativo');
        expect(obterClasseStatusSetor(setores[0])).toContain('status-badge--ativo');
        expect(obterClasseStatusSetor(setores[1])).toContain('status-badge--offline');
    });
});
