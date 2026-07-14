import { validarVisualizacaoUsuario } from './validarVisualizacaoUsuario.js';
import { MENSAGEM_SEM_PERMISSAO_DEFINIR_PAPEL_SUPERIOR } from '../constants/usuarioConstantes.js';

describe('validarVisualizacaoUsuario', () => {
    it('não deve lançar erro quando o visualizador pode ver o papel alvo', () => {
        expect(() => validarVisualizacaoUsuario('ADMIN', 'ADMINISTRATIVO')).not.toThrow();
        expect(() => validarVisualizacaoUsuario('ADMINISTRATIVO', 'ALMOXARIFADO')).not.toThrow();
    });

    it('deve lançar 403 quando o visualizador não pode ver o papel alvo', () => {
        expect(() => validarVisualizacaoUsuario('ALMOXARIFADO', 'ADMIN')).toThrow(
            expect.objectContaining({
                message: MENSAGEM_SEM_PERMISSAO_DEFINIR_PAPEL_SUPERIOR,
                statusCode: 403
            })
        );
    });

    it('deve lançar 403 para papel visualizador inválido', () => {
        expect(() => validarVisualizacaoUsuario('PAPEL_INEXISTENTE', 'COLABORADOR')).toThrow(
            expect.objectContaining({ statusCode: 403 })
        );
    });
});
