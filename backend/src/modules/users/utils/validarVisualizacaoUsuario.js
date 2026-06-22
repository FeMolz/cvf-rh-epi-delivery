import { podeAtribuirPapelUsuario } from '../../../shared/utils/hierarquiaPapeisUsuario.js';
import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';
import { MENSAGEM_SEM_PERMISSAO_DEFINIR_PAPEL_SUPERIOR } from '../constants/usuarioConstantes.js';

/**
 * @param {string} papelVisualizador
 * @param {string} papelAlvo
 */
export function validarVisualizacaoUsuario(papelVisualizador, papelAlvo) {
    if (!podeAtribuirPapelUsuario(papelVisualizador, papelAlvo)) {
        throw criarErroHttp(MENSAGEM_SEM_PERMISSAO_DEFINIR_PAPEL_SUPERIOR, 403);
    }
}
