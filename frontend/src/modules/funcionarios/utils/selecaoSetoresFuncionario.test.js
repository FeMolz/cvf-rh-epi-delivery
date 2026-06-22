import { describe, expect, it } from 'vitest';

import {
    filtrarSetoresAtivosParaFuncionario,
    montarSetoresParaFormularioFuncionario
} from './selecaoSetoresFuncionario.js';

describe('selecaoSetoresFuncionario', () => {
    const setores = [
        { id: '1', nome: 'TI', isActive: true },
        { id: '2', nome: 'RH', isActive: false }
    ];

    it('deve filtrar apenas setores ativos', () => {
        expect(filtrarSetoresAtivosParaFuncionario(setores)).toEqual([
            { id: '1', nome: 'TI', isActive: true }
        ]);
    });

    it('deve incluir setor inativo atual na edicao', () => {
        expect(montarSetoresParaFormularioFuncionario(setores, '2')).toEqual([
            { id: '2', nome: 'RH (inativo)', isActive: false },
            { id: '1', nome: 'TI', isActive: true }
        ]);
    });

    it('deve retornar apenas ativos quando nao ha setor atual inativo', () => {
        expect(montarSetoresParaFormularioFuncionario(setores, '1')).toEqual([
            { id: '1', nome: 'TI', isActive: true }
        ]);
    });
});
