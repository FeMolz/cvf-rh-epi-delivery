import { useState } from 'react';

import { ROTULOS_PAPEIS, PAPEL_COLABORADOR } from '../../../shared/constants/papeis.js';

/**
 * @param {{
 *   papeisDisponiveis: string[],
 *   onSubmit: (dados: { name: string, email: string, password: string, role: string }) => Promise<void>,
 *   carregando?: boolean
 * }} props
 */
export function FormularioCadastroUsuario({ papeisDisponiveis, onSubmit, carregando = false }) {
    const papelInicial = papeisDisponiveis.includes(PAPEL_COLABORADOR)
        ? PAPEL_COLABORADOR
        : papeisDisponiveis[0];

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(papelInicial || PAPEL_COLABORADOR);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    async function aoEnviar(evento) {
        evento.preventDefault();
        setErro('');
        setSucesso('');

        try {
            await onSubmit({ name, email, password, role });
            setSucesso('Usuário cadastrado com sucesso.');
            setName('');
            setEmail('');
            setPassword('');
            setRole(papelInicial || PAPEL_COLABORADOR);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível cadastrar o usuário.');
        }
    }

    return (
        <form className="formulario" onSubmit={aoEnviar}>
            {erro ? (
                <p className="mensagem mensagem--erro" role="alert">
                    {erro}
                </p>
            ) : null}

            {sucesso ? (
                <p className="mensagem mensagem--sucesso" role="status">
                    {sucesso}
                </p>
            ) : null}

            <div className="campo">
                <label htmlFor="nome-cadastro">Nome completo</label>
                <input
                    id="nome-cadastro"
                    type="text"
                    value={name}
                    onChange={(evento) => setName(evento.target.value)}
                    placeholder="Maria Silva"
                    required
                />
            </div>

            <div className="campo">
                <label htmlFor="email-cadastro">E-mail</label>
                <input
                    id="email-cadastro"
                    type="email"
                    value={email}
                    onChange={(evento) => setEmail(evento.target.value)}
                    placeholder="maria.silva@empresa.com"
                    required
                />
            </div>

            <div className="campo">
                <label htmlFor="senha-cadastro">Senha inicial</label>
                <input
                    id="senha-cadastro"
                    type="password"
                    value={password}
                    onChange={(evento) => setPassword(evento.target.value)}
                    placeholder="Mínimo 8 caracteres, letras e números"
                    minLength={8}
                    required
                />
            </div>

            <div className="campo">
                <label htmlFor="papel-cadastro">Permissão de acesso</label>
                <select
                    id="papel-cadastro"
                    value={role}
                    onChange={(evento) => setRole(evento.target.value)}
                    required
                >
                    {papeisDisponiveis.map((papel) => (
                        <option key={papel} value={papel}>
                            {ROTULOS_PAPEIS[papel]}
                        </option>
                    ))}
                </select>
            </div>

            <button className="botao botao--primario" type="submit" disabled={carregando}>
                {carregando ? 'Cadastrando…' : 'Cadastrar usuário'}
            </button>
        </form>
    );
}
