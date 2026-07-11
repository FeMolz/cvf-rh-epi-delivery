import { MENSAGEM_SENHA_FRACA } from '../constants/segurancaConstantes.js';
import { validarPoliticaSenha } from './validarSenha.js';

describe('validarPoliticaSenha', () => {
    it('deve aceitar senha com letras e números com tamanho mínimo', () => {
        expect(() => validarPoliticaSenha('senha123')).not.toThrow();
    });

    it('deve rejeitar senha curta', () => {
        expect(() => validarPoliticaSenha('ab1')).toThrow(MENSAGEM_SENHA_FRACA);
    });

    it('deve rejeitar senha sem número', () => {
        expect(() => validarPoliticaSenha('somenteletras')).toThrow(MENSAGEM_SENHA_FRACA);
    });

    it('deve rejeitar senha sem letras', () => {
        expect(() => validarPoliticaSenha('12345678')).toThrow(MENSAGEM_SENHA_FRACA);
    });

    it('deve rejeitar entrada que não é string', () => {
        expect(() => validarPoliticaSenha(null)).toThrow(MENSAGEM_SENHA_FRACA);
        expect(() => validarPoliticaSenha(undefined)).toThrow(MENSAGEM_SENHA_FRACA);
        expect(() => validarPoliticaSenha(12345678)).toThrow(MENSAGEM_SENHA_FRACA);
    });
});
