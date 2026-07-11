import { describe, expect, it } from 'vitest';

import { listarPapeisAtribuiveis, podeAtribuirPapelUsuario } from './hierarquiaPapeis.js';

describe('hierarquiaPapeis', () => {
    it('deve permitir ADMIN atribuir qualquer papel', () => {
        expect(podeAtribuirPapelUsuario('ADMIN', 'ADMIN')).toBe(true);
        expect(podeAtribuirPapelUsuario('ADMIN', 'COLABORADOR')).toBe(true);
    });

    it('deve impedir ADMINISTRATIVO de atribuir ADMIN', () => {
        expect(podeAtribuirPapelUsuario('ADMINISTRATIVO', 'ADMIN')).toBe(false);
        expect(podeAtribuirPapelUsuario('ADMINISTRATIVO', 'ALMOXARIFADO')).toBe(true);
    });

    it('deve listar papéis atribuíveis conforme hierarquia', () => {
        expect(listarPapeisAtribuiveis('ADMINISTRATIVO')).toEqual([
            'ADMINISTRATIVO',
            'ALMOXARIFADO',
            'COLABORADOR'
        ]);
    });

    it('deve rejeitar papeis desconhecidos ou indefinidos', () => {
        expect(podeAtribuirPapelUsuario(undefined, 'ADMIN')).toBe(false);
        expect(podeAtribuirPapelUsuario('ADMIN', 'PAPEL_INEXISTENTE')).toBe(false);
        expect(listarPapeisAtribuiveis(undefined)).toEqual([]);
        expect(podeAtribuirPapelUsuario('COLABORADOR', 'ADMIN')).toBe(false);
        expect(listarPapeisAtribuiveis('COLABORADOR')).toEqual(['COLABORADOR']);
    });
});
