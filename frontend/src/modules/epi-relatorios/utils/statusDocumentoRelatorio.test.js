import { describe, expect, it, vi } from 'vitest';

import {
    documentoLiberadoParaAlterarStatus,
    obterClasseBaseStatusDocumento,
    obterClasseResumoStatusDocumento,
    obterClasseSelectStatusDocumento,
    obterFlagsParaStatusDocumento,
    obterRotuloResumoStatusDocumento,
    obterStatusAtualDocumento
} from './statusDocumentoRelatorio.js';

describe('statusDocumentoRelatorio', () => {
    it('deve resolver status atual do documento', () => {
        expect(obterStatusAtualDocumento({})).toBe('recem_emitido');
        expect(obterStatusAtualDocumento({ foiImpresso: true })).toBe('impresso');
        expect(obterStatusAtualDocumento({ foiEncaminhado: true })).toBe('encaminhado');
        expect(obterStatusAtualDocumento({ foiAssinado: true })).toBe('assinado');
    });

    it('deve mapear flags para cada status', () => {
        expect(obterFlagsParaStatusDocumento('recem_emitido')).toEqual({
            foiImpresso: false,
            foiEncaminhado: false,
            foiAssinado: false
        });
        expect(obterFlagsParaStatusDocumento('impresso')).toEqual({
            foiImpresso: true,
            foiEncaminhado: false,
            foiAssinado: false
        });
        expect(obterFlagsParaStatusDocumento('encaminhado')).toEqual({
            foiImpresso: true,
            foiEncaminhado: true,
            foiAssinado: false
        });
        expect(obterFlagsParaStatusDocumento('assinado')).toEqual({
            foiImpresso: true,
            foiEncaminhado: true,
            foiAssinado: true
        });
    });

    it('deve indicar rotulo e classe por status', () => {
        expect(obterRotuloResumoStatusDocumento({ foiAssinado: true })).toBe('Assinado');
        expect(obterClasseResumoStatusDocumento({ foiAssinado: true })).toContain('ativo');
        expect(obterRotuloResumoStatusDocumento({ foiImpresso: true })).toBe('Impresso');
        expect(obterClasseResumoStatusDocumento({ foiImpresso: true })).toContain('impresso');
        expect(obterClasseResumoStatusDocumento({ foiEncaminhado: true })).toContain('afastado');
        expect(obterClasseBaseStatusDocumento('recem_emitido')).toContain('recem');
        expect(obterClasseSelectStatusDocumento('encaminhado')).toContain('encaminhado');
    });

    it('deve usar rotulo padrao quando opcao nao for encontrada', () => {
        const findSpy = vi.spyOn(Array.prototype, 'find').mockReturnValueOnce(undefined);

        expect(obterRotuloResumoStatusDocumento({})).toBe('Recém-emitido');

        findSpy.mockRestore();
    });

    it('deve liberar alteracao apos download ou status avancado', () => {
        const relatorioNovo = { id: 'r1' };
        const relatorioImpresso = { id: 'r2', foiImpresso: true };
        const downloads = new Set(['r1']);

        expect(documentoLiberadoParaAlterarStatus(relatorioNovo, new Set())).toBe(false);
        expect(documentoLiberadoParaAlterarStatus(relatorioNovo, downloads)).toBe(true);
        expect(documentoLiberadoParaAlterarStatus(relatorioImpresso, new Set())).toBe(true);
        expect(documentoLiberadoParaAlterarStatus({}, new Set())).toBe(false);
    });
});
