import { describe, expect, it } from 'vitest';

import { filtrarUsuarios, paginarLista } from './listagemUsuarios.js';

const usuariosMock = [
    { id: '1', name: 'Ana Admin', email: 'ana@empresa.com', role: 'ADMIN', isActive: true },
    { id: '2', name: 'Bruno Colab', email: 'bruno@empresa.com', role: 'COLABORADOR', isActive: false },
    { id: '3', name: 'Carla RH', email: 'carla@empresa.com', role: 'ADMINISTRATIVO', isActive: false }
];

describe('listagemUsuarios', () => {
    it('deve filtrar por nome, e-mail ou papel', () => {
        expect(filtrarUsuarios(usuariosMock, 'bruno')).toHaveLength(1);
        expect(filtrarUsuarios(usuariosMock, 'administrativo')).toHaveLength(1);
        expect(filtrarUsuarios(usuariosMock, 'ana@')).toHaveLength(1);
    });

    it('deve paginar resultados', () => {
        const resultado = paginarLista(usuariosMock, 1, 2);

        expect(resultado.itens).toHaveLength(2);
        expect(resultado.totalPaginas).toBe(2);
        expect(resultado.paginaAtual).toBe(1);

        const segundaPagina = paginarLista(usuariosMock, 2, 2);
        expect(segundaPagina.itens).toHaveLength(1);
    });
});
