import { PAPEL_ADMIN } from '../../../shared/constants/papeisUsuarioConstantes.js';

/**
 * Remove senha e oculta isActive para quem não é ADMIN.
 * @param {Record<string, unknown>} usuario
 * @param {string} [papelVisualizador]
 * @returns {Record<string, unknown>}
 */
export function formatarRespostaUsuario(usuario, papelVisualizador) {
    if (!usuario || typeof usuario !== 'object') {
        return usuario;
    }

    const { passwordHash: _senha, isActive, ...dadosSemSenha } = usuario;

    if (papelVisualizador === PAPEL_ADMIN) {
        return { ...dadosSemSenha, isActive };
    }

    return dadosSemSenha;
}

/**
 * @param {Record<string, unknown>[]} usuarios
 * @param {string} [papelVisualizador]
 * @returns {Record<string, unknown>[]}
 */
export function formatarListaRespostaUsuario(usuarios, papelVisualizador) {
    return usuarios.map((usuario) => formatarRespostaUsuario(usuario, papelVisualizador));
}
