import { useState } from 'react';

import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { CampoSenha } from '../../../shared/components/CampoSenha.jsx';

/**
 * @param {{ onSubmit: (dados: { email: string, password: string }) => Promise<void>, carregando?: boolean }} props
 */
export function FormularioLogin({ onSubmit, carregando = false }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [erro, setErro] = useState('');

    async function aoEnviar(evento) {
        evento.preventDefault();
        setErro('');

        try {
            await onSubmit({ email, password });
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível entrar.');
        }
    }

    return (
        <form className="formulario" onSubmit={aoEnviar}>
            <AreaMensagensFeedback erro={erro} onLimparErro={() => setErro('')} />

            <div className="campo">
                <label htmlFor="email-login">E-mail corporativo</label>
                <input
                    id="email-login"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(evento) => setEmail(evento.target.value)}
                    placeholder="seu.nome@empresa.com"
                    required
                />
            </div>

            <CampoSenha
                id="senha-login"
                rotulo="Senha"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                minLength={8}
                required
                autoComplete="current-password"
            />

            <button className="botao botao--primario" type="submit" disabled={carregando}>
                {carregando ? 'Entrando…' : 'Entrar'}
            </button>
        </form>
    );
}
