import { describe, expect, it } from 'vitest';

import { derivarNomeDoEmail } from './derivarNomeDoEmail.js';

describe('derivarNomeDoEmail', () => {
    it('deve formatar o identificador antes do arroba', () => {
        expect(derivarNomeDoEmail('maria.silva@empresa.com')).toBe('Maria Silva');
    });

    it('deve retornar Usuário quando e-mail for inválido', () => {
        expect(derivarNomeDoEmail('@empresa.com')).toBe('Usuário');
    });
});
