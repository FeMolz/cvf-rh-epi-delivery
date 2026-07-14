import { MENSAGEM_NUMERO_CA_INVALIDO } from '../constants/segurancaConstantes.js';
import { validarNumeroCaEpi } from './validarNumeroCaEpi.js';

describe('validarNumeroCaEpi', () => {
    it('deve retornar número CA somente com dígitos', () => {
        expect(validarNumeroCaEpi(' 11070 ')).toBe('11070');
    });

    it('deve rejeitar caracteres não numéricos', () => {
        expect(() => validarNumeroCaEpi('../11070')).toThrow(MENSAGEM_NUMERO_CA_INVALIDO);
    });

    it('deve rejeitar string vazia', () => {
        expect(() => validarNumeroCaEpi('')).toThrow(MENSAGEM_NUMERO_CA_INVALIDO);
    });

    it('deve rejeitar valor nulo ou indefinido', () => {
        expect(() => validarNumeroCaEpi(null)).toThrow(MENSAGEM_NUMERO_CA_INVALIDO);
        expect(() => validarNumeroCaEpi(undefined)).toThrow(MENSAGEM_NUMERO_CA_INVALIDO);
    });

    it('deve aceitar número CA informado como número', () => {
        expect(validarNumeroCaEpi(11070)).toBe('11070');
    });
});
