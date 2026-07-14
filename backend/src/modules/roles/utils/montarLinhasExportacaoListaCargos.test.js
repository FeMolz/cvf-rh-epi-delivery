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

    it('deve usar valores padrão para campos ausentes e datas inválidas', () => {
        const linhas = montarLinhasExportacaoListaCargos([
            {
                deletedAt: null,
                createdAt: 'data-invalida',
                _count: { outros: 1 }
            },
            {
                name: 'Sem contagem',
                description: null,
                deletedAt: 'data-invalida',
                createdAt: null
            }
        ]);

        expect(linhas[0]).toMatchObject({
            nome: '',
            descricao: '',
            epis: 0,
            situacao: 'Ativo',
            criadoEm: '—',
            inativadoEm: '—'
        });
        expect(linhas[1]).toMatchObject({
            nome: 'Sem contagem',
            descricao: '',
            epis: 0,
            situacao: 'Inativo',
            criadoEm: '—',
            inativadoEm: '—'
        });
    });

    it('deve formatar datas válidas em pt-BR', () => {
        const [linha] = montarLinhasExportacaoListaCargos([
            {
                name: 'Cargo',
                description: 'Desc',
                deletedAt: null,
                createdAt: new Date('2024-01-15T15:30:00.000Z'),
                _count: { roleEpis: 2 }
            }
        ]);

        expect(linha.criadoEm).not.toBe('—');
        expect(linha.inativadoEm).toBe('—');
    });
});
