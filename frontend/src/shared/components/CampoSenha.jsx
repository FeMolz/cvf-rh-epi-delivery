import { useState } from 'react';

import { IconeOlhoAberto, IconeOlhoFechado } from './IconeOlho.jsx';
import './campo-senha.css';

/**
 * @param {{
 *   id: string,
 *   rotulo: string,
 *   value: string,
 *   onChange: (valor: string) => void,
 *   placeholder?: string,
 *   minLength?: number,
 *   required?: boolean,
 *   autoComplete?: string,
 *   disabled?: boolean
 * }} props
 */
export function CampoSenha({
    id,
    rotulo,
    value,
    onChange,
    placeholder,
    minLength,
    required = false,
    autoComplete,
    disabled = false
}) {
    const [visivel, setVisivel] = useState(false);

    function alternarVisibilidade() {
        setVisivel((atual) => !atual);
    }

    return (
        <div className="campo">
            <label htmlFor={id}>{rotulo}</label>
            <div className="campo-senha">
                <input
                    id={id}
                    className="campo-senha__input"
                    type={visivel ? 'text' : 'password'}
                    value={value}
                    onChange={(evento) => onChange(evento.target.value)}
                    placeholder={placeholder}
                    minLength={minLength}
                    required={required}
                    autoComplete={autoComplete}
                    disabled={disabled}
                />
                <button
                    type="button"
                    className="campo-senha__alternar"
                    onClick={alternarVisibilidade}
                    aria-label={visivel ? 'Ocultar senha' : 'Exibir senha'}
                    aria-pressed={visivel}
                    disabled={disabled}
                >
                    {visivel ? <IconeOlhoFechado /> : <IconeOlhoAberto />}
                </button>
            </div>
        </div>
    );
}
