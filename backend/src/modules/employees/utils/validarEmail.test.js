import { validarEmail } from './validarEmail.js';

describe('validarEmail', () => {
    it('deve normalizar e aceitar e-mail válido', () => {
        expect(validarEmail('  Maria.Silva@Empresa.COM  ')).toBe('maria.silva@empresa.com');
    });

    it('deve rejeitar e-mail sem domínio', () => {
        expect(() => validarEmail('usuario@')).toThrow('E-mail inválido.');
    });

    it('deve rejeitar e-mail sem @', () => {
        expect(() => validarEmail('usuarioempresa.com')).toThrow('E-mail inválido.');
    });
});
