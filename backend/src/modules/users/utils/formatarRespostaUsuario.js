import { PAPEL_ADMIN } from '../../../shared/constants/papeisUsuarioConstantes.js';

/**
 * Remove senha. Para ADMIN, expõe isActive (presença online) e lastLogin.
 * @param {Record<string, unknown>} usuario
 * @param {string} [papelVisualizador]
 * @returns {Record<string, unknown>}
 */
export function formatarRespostaUsuario(usuario, papelVisualizador) {
    if (!usuario || typeof usuario !== 'object') {
        return usuario;
    }

    const { isActive, lastLogin, ...rest } = usuario;
    const dadosSemSenha = { ...rest };
    delete dadosSemSenha.passwordHash;

    if (papelVisualizador === PAPEL_ADMIN) {
        return { ...dadosSemSenha, isActive, lastLogin };
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
