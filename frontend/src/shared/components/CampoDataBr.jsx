import { useEffect, useRef, useState } from 'react';

import {
    aplicarMascaraDataBr,
    dataBrParaIso,
    dataIsoParaBr
} from '../utils/formatadoresBrasil.js';

/**
 * @param {{
 *   id: string,
 *   rotulo: string,
 *   value?: string,
 *   onChange: (valorIso: string) => void,
 *   required?: boolean
 * }} props
 */
export function CampoDataBr({ id, rotulo, value = '', onChange, required = false }) {
    const [texto, setTexto] = useState(() => dataIsoParaBr(value));
    const editandoRef = useRef(false);
    const idCalendario = `${id}-calendario`;

    useEffect(() => {
        if (!editandoRef.current) {
            setTexto(dataIsoParaBr(value));
        }
    }, [value]);

    function sincronizarTexto(valorDigitado) {
        const mascarado = aplicarMascaraDataBr(valorDigitado);
        setTexto(mascarado);

        if (mascarado.length === 10) {
            const iso = dataBrParaIso(mascarado);

            if (iso) {
                onChange(iso);
                return;
            }
        }

        if (!mascarado) {
            onChange('');
        }
    }

    function aoPerderFoco() {
        editandoRef.current = false;

        const mascarado = texto.trim();

        if (mascarado.length === 10) {
            const iso = dataBrParaIso(mascarado);

            if (iso) {
                onChange(iso);
                setTexto(dataIsoParaBr(iso));
                return;
            }
        }

        if (!mascarado) {
            onChange('');
            setTexto('');
            return;
        }

        setTexto(dataIsoParaBr(value));
    }

    function aoSelecionarCalendario(evento) {
        const iso = evento.target.value;
        onChange(iso);
        setTexto(dataIsoParaBr(iso));
    }

    return (
        <div className="campo campo-data-br">
            <label htmlFor={id}>{rotulo}</label>
            <div className="campo-data-br__controles">
                <div className="campo-data-br__campo">
                    <input
                        id={id}
                        className="campo-data-br__entrada"
                        type="text"
                        inputMode="numeric"
                        autoComplete="bday"
                        placeholder="DD/MM/AAAA"
                        value={texto}
                        onChange={(evento) => sincronizarTexto(evento.target.value)}
                        onFocus={() => {
                            editandoRef.current = true;
                        }}
                        onBlur={aoPerderFoco}
                        required={required}
                    />
                    <span className="campo-data-br__icone-calendario" aria-hidden="true">
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                    </span>
                    <input
                        id={idCalendario}
                        className="campo-data-br__input-calendario"
                        type="date"
                        aria-label={`Abrir calendário para ${rotulo}`}
                        value={value || ''}
                        onChange={aoSelecionarCalendario}
                    />
                </div>
            </div>
        </div>
    );
}
