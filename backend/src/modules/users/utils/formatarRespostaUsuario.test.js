import { formatarListaRespostaUsuario, formatarRespostaUsuario } from './formatarRespostaUsuario.js';

describe('formatarRespostaUsuario', () => {
    const usuarioCompleto = {
        id: '1',
        name: 'Maria',
        email: 'maria@teste.com',
        role: 'COLABORADOR',
        isActive: false,
        lastLogin: new Date('2026-06-01T12:00:00Z'),
        passwordHash: 'hash'
    };

    it('deve incluir isActive e lastLogin quando visualizador for ADMIN', () => {
        const resultado = formatarRespostaUsuario(usuarioCompleto, 'ADMIN');

        expect(resultado.isActive).toBe(false);
        expect(resultado.lastLogin).toEqual(new Date('2026-06-01T12:00:00Z'));
        expect(resultado.passwordHash).toBeUndefined();
    });

    it('deve ocultar isActive quando visualizador não for ADMIN', () => {
        const resultado = formatarRespostaUsuario(usuarioCompleto, 'ADMINISTRATIVO');

        expect(resultado.isActive).toBeUndefined();
        expect(resultado.name).toBe('Maria');
    });

    it('deve formatar lista de usuários', () => {
        const lista = formatarListaRespostaUsuario([usuarioCompleto], 'ADMIN');

        expect(lista[0].isActive).toBe(false);
    });
});
