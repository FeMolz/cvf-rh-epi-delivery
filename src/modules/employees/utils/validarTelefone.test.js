import { validarTelefone } from './validarTelefone.js';

describe('validarTelefone', () => {
    it('deve aceitar celular no formato (xx) xxxxx-xxxx', () => {
        expect(validarTelefone('(11) 98888-7777')).toBe('(11) 98888-7777');
    });

    it('deve aceitar telefone fixo no formato (xx) xxxx-xxxx', () => {
        expect(validarTelefone('(11) 3456-7890')).toBe('(11) 3456-7890');
    });

    it('deve rejeitar telefone sem máscara', () => {
        expect(() => validarTelefone('11988887777')).toThrow(
            'Telefone inválido. Use o formato (xx) xxxxx-xxxx ou (xx) xxxx-xxxx.'
        );
    });

    it('deve rejeitar telefone com formato incorreto', () => {
        expect(() => validarTelefone('11 98888-7777')).toThrow(
            'Telefone inválido. Use o formato (xx) xxxxx-xxxx ou (xx) xxxx-xxxx.'
        );
    });
});
