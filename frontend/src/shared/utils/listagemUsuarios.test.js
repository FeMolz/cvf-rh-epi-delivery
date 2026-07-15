import { describe, expect, it } from 'vitest';

import { filtrarUsuarios, formatarDataHora, paginarLista } from './listagemUsuarios.js';

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

    it('deve formatar data e hora ou retornar traco para valores invalidos', () => {
        expect(formatarDataHora('')).toBe('—');
        expect(formatarDataHora(null)).toBe('—');
        expect(formatarDataHora('invalido')).toBe('—');
        expect(formatarDataHora(new Date('2026-06-15T10:00:00.000Z'))).not.toBe('—');
    });

    it('deve retornar lista completa sem termo de busca', () => {
        expect(filtrarUsuarios(usuariosMock, '')).toHaveLength(3);
        expect(filtrarUsuarios(usuariosMock, '   ')).toHaveLength(3);
    });

    it('deve filtrar por papel sem rotulo conhecido', () => {
        const usuarios = [{ name: 'Teste', email: 't@e.com', role: 'PAPEL_CUSTOM' }];

        expect(filtrarUsuarios(usuarios, 'papel_custom')).toHaveLength(1);
    });

    it('deve ignorar campos vazios ao filtrar', () => {
        const usuarios = [{ email: 'a@b.com', role: 'ADMIN' }];

        expect(filtrarUsuarios(usuarios, 'admin')).toHaveLength(1);
        expect(filtrarUsuarios([{ name: 'Sem papel', email: 'a@b.com' }], 'sem')).toHaveLength(1);
    });

    it('deve limitar pagina ao total e paginar lista vazia', () => {
        expect(paginarLista(usuariosMock, 99, 2).paginaAtual).toBe(2);
        expect(paginarLista([], 1, 10)).toMatchObject({
            totalItens: 0,
            paginaAtual: 1,
            itens: []
        });
    });
});
