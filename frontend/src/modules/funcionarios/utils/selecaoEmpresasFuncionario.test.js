import { describe, expect, it } from 'vitest';

import {
    filtrarEmpresasAtivasParaFuncionario,
    montarEmpresasParaFormularioFuncionario
} from './selecaoEmpresasFuncionario.js';

describe('selecaoEmpresasFuncionario', () => {
    const empresas = [
        { id: '1', name: 'Empresa Ativa', isActive: true },
        { id: '2', name: 'Empresa Inativa', isActive: false }
    ];

    it('deve filtrar apenas empresas ativas', () => {
        expect(filtrarEmpresasAtivasParaFuncionario(empresas)).toEqual([
            { id: '1', name: 'Empresa Ativa', isActive: true }
        ]);
    });

    it('deve incluir empresa inativa atual na edicao', () => {
        expect(montarEmpresasParaFormularioFuncionario(empresas, '2')).toEqual([
            { id: '2', name: 'Empresa Inativa (inativa)', isActive: false },
            { id: '1', name: 'Empresa Ativa', isActive: true }
        ]);
    });

    it('deve retornar apenas ativas quando nao ha empresa atual inativa', () => {
        expect(montarEmpresasParaFormularioFuncionario(empresas, '1')).toEqual([
            { id: '1', name: 'Empresa Ativa', isActive: true }
        ]);
    });
});
