import { describe, expect, it } from 'vitest';

import { ABAS_MODULO_RECRUTAMENTO, STATUS_CADASTRO_CONTRATACAO } from '../constants/recrutamentoConstantes.js';

describe('recrutamentoConstantes — processo de aprovação', () => {
    it('deve incluir aba Processo de aprovação', () => {
        expect(ABAS_MODULO_RECRUTAMENTO.some((aba) => aba.id === 'processo-aprovacao')).toBe(true);
    });

    it('deve expor status de cadastro de contratação', () => {
        expect(STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO).toBe('AGUARDANDO_PREENCHIMENTO');
        expect(STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH).toBe('AGUARDANDO_ANALISE_RH');
    });
});
