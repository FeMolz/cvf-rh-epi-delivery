/** @type {(() => void) | null} */
let callbackSessaoExpirada = null;

let notificacaoEmAndamento = false;

/**
 * @param {() => void} callback
 * @returns {() => void}
 */
export function registrarCallbackSessaoExpirada(callback) {
    callbackSessaoExpirada = callback;

    return () => {
        if (callbackSessaoExpirada === callback) {
            callbackSessaoExpirada = null;
        }
    };
}

export function notificarSessaoExpirada() {
    if (notificacaoEmAndamento || !callbackSessaoExpirada) {
        return;
    }

    notificacaoEmAndamento = true;

    try {
        callbackSessaoExpirada();
    } finally {
        queueMicrotask(() => {
            notificacaoEmAndamento = false;
        });
    }
}

/**
 * @param {number} status
 * @param {string | undefined} tokenEnviado
 */
export function deveEncerrarSessaoPorResposta(status, tokenEnviado) {
    return status === 401 && Boolean(tokenEnviado);
}
