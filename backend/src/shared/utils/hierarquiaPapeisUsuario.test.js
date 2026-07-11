import { describe, expect, it } from '@jest/globals';

import {
    obterIndiceHierarquiaPapel,
    podeAtribuirPapelUsuario
} from './hierarquiaPapeisUsuario.js';

describe('hierarquiaPapeisUsuario', () => {
    describe('obterIndiceHierarquiaPapel', () => {
        it('deve retornar índices ordenados por privilégio', () => {
            expect(obterIndiceHierarquiaPapel('ADMIN')).toBe(0);
            expect(obterIndiceHierarquiaPapel('ADMINISTRATIVO')).toBe(1);
            expect(obterIndiceHierarquiaPapel('ALMOXARIFADO')).toBe(2);
            expect(obterIndiceHierarquiaPapel('COLABORADOR')).toBe(3);
        });

        it('deve retornar null para papel desconhecido', () => {
            expect(obterIndiceHierarquiaPapel('INVALIDO')).toBeNull();
            expect(obterIndiceHierarquiaPapel(undefined)).toBeNull();
        });
    });

    describe('podeAtribuirPapelUsuario', () => {
        it('deve permitir ADMIN atribuir qualquer papel', () => {
            expect(podeAtribuirPapelUsuario('ADMIN', 'ADMIN')).toBe(true);
            expect(podeAtribuirPapelUsuario('ADMIN', 'ADMINISTRATIVO')).toBe(true);
            expect(podeAtribuirPapelUsuario('ADMIN', 'ALMOXARIFADO')).toBe(true);
            expect(podeAtribuirPapelUsuario('ADMIN', 'COLABORADOR')).toBe(true);
        });

        it('deve permitir ADMINISTRATIVO atribuir seu nível e inferiores', () => {
            expect(podeAtribuirPapelUsuario('ADMINISTRATIVO', 'ADMIN')).toBe(false);
            expect(podeAtribuirPapelUsuario('ADMINISTRATIVO', 'ADMINISTRATIVO')).toBe(true);
            expect(podeAtribuirPapelUsuario('ADMINISTRATIVO', 'ALMOXARIFADO')).toBe(true);
            expect(podeAtribuirPapelUsuario('ADMINISTRATIVO', 'COLABORADOR')).toBe(true);
        });

        it('deve negar atribuição de papel superior ao solicitante', () => {
            expect(podeAtribuirPapelUsuario('ALMOXARIFADO', 'ADMIN')).toBe(false);
            expect(podeAtribuirPapelUsuario('ALMOXARIFADO', 'ADMINISTRATIVO')).toBe(false);
            expect(podeAtribuirPapelUsuario('COLABORADOR', 'ALMOXARIFADO')).toBe(false);
        });

        it('deve negar atribuição quando papel for desconhecido', () => {
            expect(podeAtribuirPapelUsuario('ADMIN', 'INVALIDO')).toBe(false);
            expect(podeAtribuirPapelUsuario(undefined, 'COLABORADOR')).toBe(false);
        });
    });
});
