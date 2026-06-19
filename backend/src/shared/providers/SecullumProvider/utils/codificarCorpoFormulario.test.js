import { codificarCorpoFormulario } from './codificarCorpoFormulario.js';

describe('codificarCorpoFormulario', () => {
    it('deve codificar campos em application/x-www-form-urlencoded', () => {
        const resultado = codificarCorpoFormulario({
            grant_type: 'password',
            username: 'usuario@email.com',
            password: 'senha&especial'
        });

        expect(resultado).toContain('grant_type=password');
        expect(resultado).toContain('username=usuario%40email.com');
        expect(resultado).toContain('password=senha%26especial');
    });
});
