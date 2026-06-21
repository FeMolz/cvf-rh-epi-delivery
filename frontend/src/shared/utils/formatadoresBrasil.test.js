import { describe, expect, it } from 'vitest';

import {
    aplicarMascaraCnpj,
    aplicarMascaraCpf,
    aplicarMascaraDataBr,
    aplicarMascaraTelefone,
    cnpjEstaCompleto,
    cpfEstaCompleto,
    dataBrParaIso,
    dataIsoParaBr,
    telefoneEstaCompleto
} from './formatadoresBrasil.js';

describe('formatadoresBrasil', () => {
    it('deve formatar cnpj enquanto digita', () => {
        expect(aplicarMascaraCnpj('11222333000181')).toBe('11.222.333/0001-81');
        expect(cnpjEstaCompleto('11.222.333/0001-81')).toBe(true);
    });

    it('deve formatar cpf enquanto digita', () => {
        expect(aplicarMascaraCpf('52998224725')).toBe('529.982.247-25');
        expect(aplicarMascaraCpf('529.982.247-25')).toBe('529.982.247-25');
    });

    it('deve formatar telefone celular e fixo', () => {
        expect(aplicarMascaraTelefone('11988887777')).toBe('(11) 98888-7777');
        expect(aplicarMascaraTelefone('1133334444')).toBe('(11) 3333-4444');
    });

    it('deve formatar data digitada sem barras', () => {
        expect(aplicarMascaraDataBr('16102005')).toBe('16/10/2005');
        expect(dataBrParaIso('16/10/2005')).toBe('2005-10-16');
        expect(dataIsoParaBr('2005-10-16')).toBe('16/10/2005');
    });

    it('deve validar cpf e telefone completos', () => {
        expect(cpfEstaCompleto('529.982.247-25')).toBe(true);
        expect(cpfEstaCompleto('5299822472')).toBe(false);
        expect(telefoneEstaCompleto('(11) 98888-7777')).toBe(true);
        expect(telefoneEstaCompleto('(11) 3333-4444')).toBe(true);
    });
});
