import { useState } from 'react';

import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { CampoSenha } from '../../../shared/components/CampoSenha.jsx';
import { ROTULOS_PAPEIS, PAPEL_COLABORADOR } from '../../../shared/constants/papeis.js';
import { normalizarTextoMaiusculo } from '../../../shared/utils/normalizarTextoMaiusculo.js';
import { derivarNomeDoEmail } from '../utils/derivarNomeDoEmail.js';

/**
 * @param {{
 *   papeisDisponiveis: string[],
 *   onSubmit: (dados: { name: string, email: string, password: string, role: string }) => Promise<void>,
 *   carregando?: boolean,
 *   variante?: 'padrao' | 'acesso'
 * }} props
 */
export function FormularioCadastroUsuario({
    papeisDisponiveis,
    onSubmit,
    carregando = false,
    variante = 'padrao'
}) {
    const papelInicial = papeisDisponiveis.includes(PAPEL_COLABORADOR)
        ? PAPEL_COLABORADOR
        : papeisDisponiveis[0];

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(papelInicial || PAPEL_COLABORADOR);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    const modoAcesso = variante === 'acesso';
    const rotuloEnviar = modoAcesso ? 'Criar Novo Acesso' : 'Cadastrar usuário';

    async function aoEnviar(evento) {
        evento.preventDefault();
        setErro('');
        setSucesso('');

        try {
            await onSubmit({
                name: modoAcesso
                    ? normalizarTextoMaiusculo(derivarNomeDoEmail(email))
                    : normalizarTextoMaiusculo(name),
                email,
                password,
                role
            });
            setSucesso(
                modoAcesso ? 'Acesso criado com sucesso.' : 'Usuário cadastrado com sucesso.'
            );
            setName('');
            setEmail('');
            setPassword('');
            setRole(papelInicial || PAPEL_COLABORADOR);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível cadastrar o usuário.');
        }
    }

    return (
        <form
            className={`formulario${modoAcesso ? ' formulario--criar-acesso' : ''}`}
            onSubmit={aoEnviar}
        >
            <AreaMensagensFeedback
                erro={erro}
                sucesso={sucesso}
                onLimparErro={() => setErro('')}
                onLimparSucesso={() => setSucesso('')}
            />

            {modoAcesso ? (
                <div className="formulario__grade formulario__grade--criar-acesso">
                    <div className="campo">
                        <label htmlFor="email-cadastro">Identificador / E-mail</label>
                        <input
                            id="email-cadastro"
                            type="email"
                            value={email}
                            onChange={(evento) => setEmail(evento.target.value)}
                            placeholder="usuario@exemplo.com"
                            required
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="papel-cadastro">Tipo de acesso (papel)</label>
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

                    <CampoSenha
                        id="senha-cadastro"
                        rotulo="Senha inicial"
                        value={password}
                        onChange={setPassword}
                        placeholder="Mínimo 8 caracteres, letras e números"
                        minLength={8}
                        required
                    />

                    <div className="formulario__acao-criar-acesso">
                        <button className="botao botao--primario" type="submit" disabled={carregando}>
                            {carregando ? 'Criando…' : rotuloEnviar}
                        </button>
                    </div>
                </div>
            ) : (
                <>
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

                    <CampoSenha
                        id="senha-cadastro"
                        rotulo="Senha inicial"
                        value={password}
                        onChange={setPassword}
                        placeholder="Mínimo 8 caracteres, letras e números"
                        minLength={8}
                        required
                    />

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
                        {carregando ? 'Cadastrando…' : rotuloEnviar}
                    </button>
                </>
            )}
        </form>
    );
}
