import { describe, expect, it } from 'vitest';

import {
    empresaEstaAtiva,
    filtrarEmpresas,
    filtrarEmpresasPorSituacao,
    obterClasseStatusEmpresa,
    obterRotuloStatusEmpresa
} from './listagemEmpresas.js';

describe('listagemEmpresas', () => {
    const empresas = [
        { id: '1', name: 'Alpha', cnpj: '11.111.111/0001-11', isActive: true },
        { id: '2', name: 'Beta', cnpj: '22.222.222/0001-22', isActive: false }
    ];

    it('deve identificar empresa ativa', () => {
        expect(empresaEstaAtiva(empresas[0])).toBe(true);
        expect(empresaEstaAtiva(empresas[1])).toBe(false);
    });

    it('deve filtrar por situação', () => {
        expect(filtrarEmpresasPorSituacao(empresas, false)).toHaveLength(1);
        expect(filtrarEmpresasPorSituacao(empresas, true)).toHaveLength(1);
    });

    it('deve filtrar por termo de busca', () => {
        expect(filtrarEmpresas(empresas, 'alpha')).toHaveLength(1);
        expect(filtrarEmpresas(empresas, '0001-22')).toHaveLength(1);
    });

    it('deve retornar rótulo de status', () => {
        expect(obterRotuloStatusEmpresa(empresas[0])).toBe('Ativa');
        expect(obterRotuloStatusEmpresa(empresas[1])).toBe('Inativa');
        expect(obterClasseStatusEmpresa(empresas[0])).toContain('status-badge--ativo');
        expect(obterClasseStatusEmpresa(empresas[1])).toContain('status-badge--offline');
    });
});
