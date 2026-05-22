import { MENSAGEM_EMAIL_INVALIDO } from '../constants/recrutamentoConstantes.js';
import { validarEmailCandidato } from './validarEmailCandidato.js';

describe('validarEmailCandidato', () => {
    it('deve aceitar email valido', () => {
        expect(() => validarEmailCandidato('candidato@empresa.com.br')).not.toThrow();
    });

    it('deve rejeitar email invalido', () => {
        expect(() => validarEmailCandidato('email-invalido')).toThrow(MENSAGEM_EMAIL_INVALIDO);
    });

    it('deve rejeitar email sem dominio', () => {
        expect(() => validarEmailCandidato('user@')).toThrow(MENSAGEM_EMAIL_INVALIDO);
    });
});
