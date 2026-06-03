import { formatarListaRespostaUsuario, formatarRespostaUsuario } from './formatarRespostaUsuario.js';

describe('formatarRespostaUsuario', () => {
    const usuarioCompleto = {
        id: '1',
        name: 'Maria',
        email: 'maria@teste.com',
        role: 'COLABORADOR',
        isActive: false,
        passwordHash: 'hash'
    };

    it('deve incluir isActive quando visualizador for ADMIN', () => {
        const resultado = formatarRespostaUsuario(usuarioCompleto, 'ADMIN');

        expect(resultado.isActive).toBe(false);
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
