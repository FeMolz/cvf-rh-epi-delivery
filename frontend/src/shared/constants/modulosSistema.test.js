import { describe, expect, it } from 'vitest';

import { listarModulosVisiveis, MODULOS_SISTEMA } from './modulosSistema.js';
import {
    PAPEL_ADMIN,
    PAPEL_ADMINISTRATIVO,
    PAPEL_ALMOXARIFADO,
    PAPEL_COLABORADOR
} from './papeis.js';

describe('modulosSistema', () => {
    const modulosEmBreve = MODULOS_SISTEMA.filter((modulo) => modulo.emBreve);

    it('deve manter Quesitos, Recrutamento e Ponto como em breve', () => {
        expect(modulosEmBreve.map((modulo) => modulo.id)).toEqual([
            'quesitos',
            'recruitment',
            'ponto'
        ]);
    });

    it('deve expor modulos em breve apenas para admin e administrativo', () => {
        for (const modulo of modulosEmBreve) {
            expect(modulo.papeis).toEqual([PAPEL_ADMIN, PAPEL_ADMINISTRATIVO]);
            expect(modulo.rota).toBeUndefined();
        }
    });

    it('deve listar apenas entregas de EPI para almoxarifado', () => {
        const modulos = listarModulosVisiveis(PAPEL_ALMOXARIFADO);

        expect(modulos).toHaveLength(1);
        expect(modulos[0].id).toBe('epi-deliveries');
    });

    it('deve listar modulos de gestao para administrativo', () => {
        const modulos = listarModulosVisiveis(PAPEL_ADMINISTRATIVO);
        const ids = modulos.map((modulo) => modulo.id);

        expect(ids).toContain('gerenciamento');
        expect(ids).toContain('cadastramento');
        expect(ids).toContain('departamento-pessoal');
        expect(ids).toContain('epi-reports');
        expect(ids).not.toContain('employees');
    });

    it('nao deve listar modulos para colaborador', () => {
        expect(listarModulosVisiveis(PAPEL_COLABORADOR)).toEqual([]);
    });

    it('admin deve ver todos os modulos cadastrados', () => {
        expect(listarModulosVisiveis(PAPEL_ADMIN)).toHaveLength(MODULOS_SISTEMA.length);
    });
});
