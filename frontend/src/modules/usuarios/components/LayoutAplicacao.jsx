import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { ROTULOS_PAPEIS } from '../../../shared/constants/papeis.js';
import './layout-aplicacao.css';

export function LayoutAplicacao({ titulo, subtitulo, children }) {
    const { user, logout, podeCadastrarUsuarios } = useAuth();
    const navegar = useNavigate();

    async function aoSair() {
        await logout();
        navegar('/login');
    }

    return (
        <div className="layout">
            <header className="layout__cabecalho">
                <div className="layout__marca">
                    <span className="layout__logo">RH</span>
                    <div>
                        <strong>RH-System</strong>
                        <small>Gestão de pessoas e SST</small>
                    </div>
                </div>

                {user ? (
                    <div className="layout__usuario">
                        <div className="layout__usuario-info">
                            <span>{user.name}</span>
                            <small>{ROTULOS_PAPEIS[user.role] || user.role}</small>
                        </div>
                        {podeCadastrarUsuarios ? (
                            <Link className="layout__link" to="/usuarios/cadastro">
                                Cadastrar usuário
                            </Link>
                        ) : null}
                        <button className="botao botao--secundario" type="button" onClick={aoSair}>
                            Sair
                        </button>
                    </div>
                ) : null}
            </header>

            <main className="layout__conteudo">
                <section className="cartao">
                    <header className="cartao__cabecalho">
                        <h1>{titulo}</h1>
                        {subtitulo ? <p>{subtitulo}</p> : null}
                    </header>
                    {children}
                </section>
            </main>
        </div>
    );
}
