/**
 * @param {string} token
 * @returns {number | null} Timestamp em milissegundos ou null se inválido
 */
export function obterExpiracaoJwt(token) {
    try {
        const partePayload = token.split('.')[1];

        if (!partePayload) {
            return null;
        }

        const jsonPayload = atob(partePayload.replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(jsonPayload);

        return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
    } catch {
        return null;
    }
}

/**
 * @param {string} token
 */
export function tokenJwtExpirado(token) {
    const expiracao = obterExpiracaoJwt(token);

    if (expiracao === null) {
        return false;
    }

    return Date.now() >= expiracao;
}

/**
 * @param {string} token
 * @returns {number | null} Milissegundos até expirar ou null se não calculável
 */
export function obterTempoRestanteJwt(token) {
    const expiracao = obterExpiracaoJwt(token);

    if (expiracao === null) {
        return null;
    }

    return Math.max(0, expiracao - Date.now());
}
