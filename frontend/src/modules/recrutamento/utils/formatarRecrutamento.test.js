import { describe, expect, it } from 'vitest';

import {
    filtrarVagasPorTermo,
    filtrarVagasPublicas,
    listarLocaisTrabalhoUnicos
} from './formatarRecrutamento.js';

const VAGAS = [
    {
        id: '1',
        tituloVaga: 'Analista RH',
        localTrabalho: 'São Paulo',
        modoTrabalho: 'PRESENCIAL',
        tipoContratacao: 'CLT'
    },
    {
        id: '2',
        tituloVaga: 'Dev Frontend',
        localTrabalho: 'Remoto',
        modoTrabalho: 'REMOTO',
        tipoContratacao: 'PJ'
    },
    {
        id: '3',
        tituloVaga: 'Estagiário',
        localTrabalho: 'São Paulo',
        modoTrabalho: 'HIBRIDO',
        tipoContratacao: 'ESTAGIO'
    }
];

describe('formatarRecrutamento filtros', () => {
    it('deve filtrar por termo no titulo', () => {
        expect(filtrarVagasPorTermo(VAGAS, 'frontend')).toHaveLength(1);
    });

    it('deve filtrar por modo, tipo e local juntos', () => {
        const resultado = filtrarVagasPublicas(VAGAS, {
            modoTrabalho: 'PRESENCIAL',
            tipoContratacao: 'CLT',
            localTrabalho: 'São Paulo'
        });

        expect(resultado).toHaveLength(1);
        expect(resultado[0].id).toBe('1');
    });

    it('deve listar locais unicos ordenados', () => {
        expect(listarLocaisTrabalhoUnicos(VAGAS)).toEqual(['Remoto', 'São Paulo']);
    });
});
