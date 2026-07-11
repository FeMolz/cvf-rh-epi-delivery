import { describe, expect, it } from 'vitest';

import { montarPayloadFuncionario } from './montarPayloadFuncionario.js';

describe('montarPayloadFuncionario', () => {
    it('deve montar payload com campos obrigatorios', () => {
        const payload = montarPayloadFuncionario({
            name: 'Maria',
            cpf: '529.982.247-25',
            email: 'maria@empresa.com',
            telefone: '(11) 98888-7777',
            birthDate: '1995-08-12',
            companyId: 'empresa-1',
            roleId: 'cargo-1',
            setorId: 'setor-1'
        });

        expect(payload).toMatchObject({
            name: 'Maria',
            cpf: '529.982.247-25',
            email: 'maria@empresa.com',
            telefone: '(11) 98888-7777',
            birthDate: '1995-08-12',
            companyId: 'empresa-1',
            roleId: 'cargo-1',
            setorId: 'setor-1'
        });
    });

    it('deve incluir endereco e beneficios quando informados', () => {
        const payload = montarPayloadFuncionario({
            name: 'Maria',
            cpf: '529.982.247-25',
            email: 'maria@empresa.com',
            telefone: '(11) 98888-7777',
            birthDate: '1995-08-12',
            companyId: 'empresa-1',
            roleId: 'cargo-1',
            setorId: 'setor-1',
            cep: '01310-100',
            cidade: 'São Paulo',
            valeTransporte: true,
            valeAlimentacao: false,
            planoSaude: true
        });

        expect(payload).toMatchObject({
            cep: '01310-100',
            cidade: 'São Paulo',
            valeTransporte: true,
            valeAlimentacao: false,
            planoSaude: true
        });
    });

    it('deve incluir status e data de desligamento na edicao', () => {
        const payload = montarPayloadFuncionario({
            name: 'Maria',
            cpf: '529.982.247-25',
            email: 'maria@empresa.com',
            telefone: '(11) 98888-7777',
            birthDate: '1995-08-12',
            companyId: 'empresa-1',
            roleId: 'cargo-1',
            setorId: 'setor-1',
            status: 'FERIAS',
            resignationDate: '2026-01-10'
        });

        expect(payload).toMatchObject({
            status: 'FERIAS',
            resignationDate: '2026-01-10'
        });
    });

    it('deve incluir admissionDate, leaveReturnDate e numeroDependentes', () => {
        const payload = montarPayloadFuncionario({
            name: 'Maria',
            cpf: '529.982.247-25',
            email: 'maria@empresa.com',
            telefone: '(11) 98888-7777',
            birthDate: '1995-08-12',
            companyId: 'empresa-1',
            roleId: 'cargo-1',
            setorId: 'setor-1',
            admissionDate: '2020-01-01',
            leaveReturnDate: '2026-03-01',
            numeroDependentes: '2',
            nacionalidade: '   ',
            cidade: 'São Paulo'
        });

        expect(payload).toMatchObject({
            admissionDate: '2020-01-01',
            leaveReturnDate: '2026-03-01',
            numeroDependentes: 2,
            cidade: 'São Paulo'
        });
        expect(payload.nacionalidade).toBeUndefined();
    });
});
