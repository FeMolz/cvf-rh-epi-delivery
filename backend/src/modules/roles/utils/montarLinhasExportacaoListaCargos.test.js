import { describe, expect, it } from '@jest/globals';

import { montarLinhasExportacaoListaCargos } from './montarLinhasExportacaoListaCargos.js';

describe('montarLinhasExportacaoListaCargos', () => {
    it('deve montar linhas com situação e quantidade de EPIs', () => {
        const linhas = montarLinhasExportacaoListaCargos([
            {
                name: 'Operador',
                description: 'Linha de produção',
                deletedAt: null,
                createdAt: '2024-01-01T12:00:00.000Z',
                _count: { roleEpis: 3 }
            },
            {
                name: 'Auxiliar',
                description: 'Apoio',
                deletedAt: '2024-06-01T12:00:00.000Z',
                createdAt: '2024-01-01T12:00:00.000Z',
                _count: { roleEpis: 0 }
            }
        ]);

        expect(linhas).toHaveLength(2);
        expect(linhas[0]).toMatchObject({
            nome: 'Operador',
            epis: 3,
            situacao: 'Ativo'
        });
        expect(linhas[1].situacao).toBe('Inativo');
    });
});
