import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../config/env.js', () => ({
    default: { TOKEN_CADASTRO_VALIDADE_DIAS: 7 }
}));

const { tokenCadastroContratacaoExpirado } = await import('./tokenCadastroContratacaoExpirado.js');

describe('tokenCadastroContratacaoExpirado', () => {
    it('deve retornar falso para token dentro da validade', () => {
        const criadoEm = new Date('2026-06-01T10:00:00Z');
        const referencia = new Date('2026-06-05T10:00:00Z');

        expect(tokenCadastroContratacaoExpirado(criadoEm, referencia)).toBe(false);
    });

    it('deve retornar verdadeiro após período de validade', () => {
        const criadoEm = new Date('2026-05-01T10:00:00Z');
        const referencia = new Date('2026-06-10T10:00:00Z');

        expect(tokenCadastroContratacaoExpirado(criadoEm, referencia)).toBe(true);
    });
});
