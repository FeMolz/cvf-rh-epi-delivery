import { montarLinhasExportacaoListaFuncionarios } from './montarLinhasExportacaoListaFuncionarios.js';

describe('montarLinhasExportacaoListaFuncionarios', () => {
    it('deve preencher data de demissão apenas para status inativo', () => {
        const linhas = montarLinhasExportacaoListaFuncionarios([
            {
                name: 'Maria',
                status: 'ATIVO',
                resignationDate: null,
                role: { name: 'Analista' },
                setor: { nome: 'TI' }
            },
            {
                name: 'João',
                status: 'INATIVO',
                resignationDate: new Date('2026-01-15T00:00:00.000Z'),
                role: { name: 'Auxiliar' },
                setor: { nome: 'OBRAS' }
            }
        ]);

        expect(linhas[0].dataDemissao).toBe('');
        expect(linhas[1].dataDemissao).toBe('15/01/2026');
        expect(linhas[0]).toMatchObject({
            nome: 'Maria',
            cargo: 'Analista',
            setor: 'TI',
            status: 'ATIVO'
        });
    });
});
