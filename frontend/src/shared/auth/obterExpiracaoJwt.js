/**
 * Lê o claim `exp` do JWT (sem validar assinatura — apenas para expiração no cliente).
 *
 * @param {string | null | undefined} token
 * @returns {number | null} Timestamp em milissegundos ou null se inválido
 */
export function obterExpiracaoJwtEmMs(token) {
    if (!token || typeof token !== 'string') {
        return null;
    }

    const partes = token.split('.');

    if (partes.length < 2) {
        return null;
    }

    try {
        const payloadCodificado = partes[1].replace(/-/g, '+').replace(/_/g, '/');
        const padding = '='.repeat((4 - (payloadCodificado.length % 4)) % 4);
        const payloadJson = atob(`${payloadCodificado}${padding}`);
        const payload = JSON.parse(payloadJson);

        if (typeof payload.exp !== 'number') {
            return null;
        }

        return payload.exp * 1000;
    } catch {
        return null;
    }
}

/**
 * @param {string | null | undefined} token
 * @param {number} [agora=Date.now()]
 */
export function tokenJwtExpirado(token, agora = Date.now()) {
    const expiraEm = obterExpiracaoJwtEmMs(token);

    if (!expiraEm) {
        return false;
    }

    return expiraEm <= agora;
}
