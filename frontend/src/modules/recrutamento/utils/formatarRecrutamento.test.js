import { describe, expect, it } from 'vitest';

import { STATUS_ANUNCIO_VAGA } from '../constants/recrutamentoConstantes.js';
import {
    filtrarVagasPorTermo,
    filtrarVagasPublicas,
    listarLocaisTrabalhoUnicos,
    obterClasseStatusVaga,
    obterRotuloModoTrabalho,
    obterRotuloStatusCandidatura,
    obterRotuloStatusVaga,
    obterRotuloTipoContratacao
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
    },
    {
        id: '4',
        tituloVaga: 'Sem local',
        localTrabalho: undefined,
        modoTrabalho: 'REMOTO',
        tipoContratacao: 'CLT'
    }
];

describe('formatarRecrutamento filtros', () => {
    it('deve filtrar por termo no titulo', () => {
        expect(filtrarVagasPorTermo(VAGAS, 'frontend')).toHaveLength(1);
    });

    it('deve retornar lista completa quando termo estiver vazio', () => {
        expect(filtrarVagasPorTermo(VAGAS, '   ')).toHaveLength(4);
    });

    it('deve filtrar por termo mesmo com titulo ou local ausentes', () => {
        expect(
            filtrarVagasPorTermo(
                [
                    { id: 'x', tituloVaga: undefined, localTrabalho: undefined },
                    { id: 'y', tituloVaga: 'Dev', localTrabalho: null }
                ],
                'dev'
            )
        ).toEqual([{ id: 'y', tituloVaga: 'Dev', localTrabalho: null }]);
    });

    it('deve filtrar por termo no local de trabalho quando titulo nao corresponder', () => {
        const resultado = filtrarVagasPorTermo(VAGAS, 'paulo');
        expect(resultado.map((vaga) => vaga.id)).toEqual(['1', '3']);
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

    it('deve excluir vagas com local diferente do filtro', () => {
        const resultado = filtrarVagasPublicas(VAGAS, { localTrabalho: 'Curitiba' });
        expect(resultado).toHaveLength(0);
    });

    it('deve listar locais unicos ordenados ignorando vazios', () => {
        expect(listarLocaisTrabalhoUnicos(VAGAS)).toEqual(['Remoto', 'São Paulo']);
        expect(listarLocaisTrabalhoUnicos([{ localTrabalho: '  ' }, { localTrabalho: 10 }])).toEqual(
            []
        );
    });
});

describe('formatarRecrutamento rotulos', () => {
    it('deve obter rotulos conhecidos e fallback', () => {
        expect(obterRotuloStatusCandidatura('NOVA')).toBeTruthy();
        expect(obterRotuloStatusCandidatura('XYZ')).toBe('XYZ');
        expect(obterRotuloModoTrabalho('REMOTO')).toBeTruthy();
        expect(obterRotuloModoTrabalho('XYZ')).toBe('XYZ');
        expect(obterRotuloTipoContratacao('CLT')).toBeTruthy();
        expect(obterRotuloTipoContratacao('XYZ')).toBe('XYZ');
    });

    it('deve obter rotulo e classe de status da vaga', () => {
        expect(obterRotuloStatusVaga(STATUS_ANUNCIO_VAGA.INATIVA)).toBe('Rascunho');
        expect(obterRotuloStatusVaga(STATUS_ANUNCIO_VAGA.ATIVA)).toBe('Ativa');
        expect(obterRotuloStatusVaga(STATUS_ANUNCIO_VAGA.ENCERRADA)).toBe('Encerrada');
        expect(obterRotuloStatusVaga('OUTRO')).toBe('OUTRO');

        expect(obterClasseStatusVaga(STATUS_ANUNCIO_VAGA.ATIVA)).toContain('ativo');
        expect(obterClasseStatusVaga(STATUS_ANUNCIO_VAGA.ENCERRADA)).toContain('encerrado');
        expect(obterClasseStatusVaga(STATUS_ANUNCIO_VAGA.INATIVA)).toContain('offline');
    });
});
