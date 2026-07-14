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

    it('deve mapear campos opcionais vazios e dependentes nulos', () => {
        const formulario = mapearFuncionarioParaFormulario({
            numeroDependentes: null,
            leaveReturnDate: '2026-02-01T00:00:00.000Z'
        });

        expect(formulario.numeroDependentes).toBe('');
        expect(formulario.leaveReturnDate).toBe('2026-02-01');
        expect(formulario.nacionalidade).toBe('');
        expect(formulario.cep).toBe('');
        expect(formulario.valeTransporte).toBe(false);
    });

    it('deve tratar numero de dependentes indefinido', () => {
        const formulario = mapearFuncionarioParaFormulario({});

        expect(formulario.numeroDependentes).toBe('');
    });

    it('deve converter numero de dependentes informado', () => {
        const formulario = mapearFuncionarioParaFormulario({ numeroDependentes: 2 });

        expect(formulario.numeroDependentes).toBe('2');
    });
});
