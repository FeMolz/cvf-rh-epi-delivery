import { useCallback, useEffect, useRef, useState } from 'react';

export const DURACAO_MENSAGEM_FEEDBACK_MS = 5000;

/**
 * @param {number} [duracaoMs]
 */
export function useMensagemTemporaria(duracaoMs = DURACAO_MENSAGEM_FEEDBACK_MS) {
    const [mensagem, setMensagem] = useState('');
    const timeoutRef = useRef(null);

    const limparMensagem = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        setMensagem('');
    }, []);

    const definirMensagem = useCallback(
        (texto, { temporario = Boolean(texto) } = {}) => {
            limparMensagem();
            setMensagem(texto);

            if (temporario && texto) {
                timeoutRef.current = setTimeout(() => {
                    setMensagem('');
                    timeoutRef.current = null;
                }, duracaoMs);
            }
        },
        [duracaoMs, limparMensagem]
    );

    useEffect(() => () => limparMensagem(), [limparMensagem]);

    return { mensagem, definirMensagem, limparMensagem };
}
