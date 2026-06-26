/** @type {(() => void) | null} */
let aoSessaoExpirada = null;

let sessaoExpiradaNotificada = false;

/**
 * @param {() => void} callback
 */
export function registrarAoSessaoExpirada(callback) {
    aoSessaoExpirada = callback;
}

export function reiniciarNotificacaoSessaoExpirada() {
    sessaoExpiradaNotificada = false;
}

export function notificarSessaoExpirada() {
    if (sessaoExpiradaNotificada) {
        return;
    }

    sessaoExpiradaNotificada = true;
    aoSessaoExpirada?.();
}
