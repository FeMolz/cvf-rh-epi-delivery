import { describe, expect, it } from 'vitest';

import { mapearFuncionarioParaFormulario } from './mapearFuncionarioParaFormulario.js';

describe('mapearFuncionarioParaFormulario', () => {
    it('deve mapear dados da api para o formulario', () => {
        const formulario = mapearFuncionarioParaFormulario({
            name: 'Maria',
            cpf: '52998224725',
            email: 'maria@empresa.com',
            telefone: '11988887777',
            birthDate: '1995-08-12T00:00:00.000Z',
            admissionDate: '2024-03-01T00:00:00.000Z',
            resignationDate: '2026-01-10T00:00:00.000Z',
            status: 'FERIAS',
            companyId: 'empresa-1',
            roleId: 'cargo-1',
            setorId: 'setor-1',
            valeTransporte: true,
            valeAlimentacao: false,
            planoSaude: true
        });

        expect(formulario).toMatchObject({
            name: 'Maria',
            cpf: '529.982.247-25',
            email: 'maria@empresa.com',
            telefone: '(11) 98888-7777',
            birthDate: '1995-08-12',
            admissionDate: '2024-03-01',
            resignationDate: '2026-01-10',
            status: 'FERIAS',
            companyId: 'empresa-1',
            roleId: 'cargo-1',
            setorId: 'setor-1',
            valeTransporte: true,
            valeAlimentacao: false,
            planoSaude: true
        });
    });
});
