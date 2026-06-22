import { useEffect } from 'react';

import { DURACAO_MENSAGEM_FEEDBACK_MS } from '../hooks/useMensagemTemporaria.js';

/**
 * @param {{
 *   texto: string,
 *   tipo: 'erro' | 'sucesso' | 'aviso',
 *   onOcultar: () => void,
 *   duracaoMs?: number,
 *   temporario?: boolean
 * }} props
 */
function MensagemTemporaria({
    texto,
    tipo,
    onOcultar,
    duracaoMs = DURACAO_MENSAGEM_FEEDBACK_MS,
    temporario = true
}) {
    useEffect(() => {
        if (!texto || !temporario) {
            return undefined;
        }

        const temporizador = setTimeout(() => {
            onOcultar();
        }, duracaoMs);

        return () => clearTimeout(temporizador);
    }, [texto, duracaoMs, onOcultar, temporario]);

    if (!texto) {
        return null;
    }

    return (
        <p className={`mensagem mensagem--${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
            {texto}
        </p>
    );
}

/**
 * @param {{
 *   erro?: string,
 *   sucesso?: string,
 *   aviso?: string,
 *   onLimparErro?: () => void,
 *   onLimparSucesso?: () => void,
 *   onLimparAviso?: () => void,
 *   duracaoMs?: number,
 *   avisoTemporario?: boolean,
 *   className?: string
 * }} props
 */
export function AreaMensagensFeedback({
    erro = '',
    sucesso = '',
    aviso = '',
    onLimparErro,
    onLimparSucesso,
    onLimparAviso,
    duracaoMs = DURACAO_MENSAGEM_FEEDBACK_MS,
    avisoTemporario = false,
    className = ''
}) {
    if (!erro && !sucesso && !aviso) {
        return null;
    }

    const classes = ['feedback-mensagens', className].filter(Boolean).join(' ');

    return (
        <div className={classes}>
            <MensagemTemporaria
                texto={erro}
                tipo="erro"
                duracaoMs={duracaoMs}
                onOcultar={() => onLimparErro?.()}
            />
            <MensagemTemporaria
                texto={sucesso}
                tipo="sucesso"
                duracaoMs={duracaoMs}
                onOcultar={() => onLimparSucesso?.()}
            />
            <MensagemTemporaria
                texto={aviso}
                tipo="aviso"
                duracaoMs={duracaoMs}
                temporario={avisoTemporario}
                onOcultar={() => onLimparAviso?.()}
            />
        </div>
    );
}
