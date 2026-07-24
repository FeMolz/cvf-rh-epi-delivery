import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { LogoSistema, NOME_SISTEMA } from '../../../shared/components/LogoSistema.jsx';
import { useAuth } from '../../../shared/auth/useAuth.js';
import { ROTULOS_PAPEIS } from '../../../shared/constants/papeis.js';
import './layout-aplicacao.css';

/**
 * @param {{
 *   titulo: string,
 *   subtitulo?: string | null,
 *   children: import('react').ReactNode,
 *   largura?: 'padrao' | 'ampla',
 *   variante?: 'padrao' | 'aberta'
 * }} props
 */
export function LayoutAplicacao({
    titulo,
    subtitulo,
    children,
    largura = 'padrao',
    variante = 'padrao'
}) {
    const { user, logout, podeCadastrarUsuarios } = useAuth();
    const navegar = useNavigate();

    const classesCartao = [
        'cartao',
        largura === 'ampla' ? 'cartao--amplo' : '',
        variante === 'aberta' ? 'cartao--aberto' : ''
    ]
        .filter(Boolean)
        .join(' ');

    useEffect(() => {
        document.title = NOME_SISTEMA;
    }, []);

    async function aoSair() {
        await logout();
        navegar('/login');
    }

    return (
        <div className="layout">
            <header className="layout__cabecalho">
                <div className="layout__marca">
                    <LogoSistema className="logo-sistema--cabecalho" />
                </div>

                {user ? (
                    <div className="layout__usuario">
                        <div className="layout__usuario-info">
                            <span>{user.name}</span>
                            <small>{ROTULOS_PAPEIS[user.role] || user.role}</small>
                        </div>
                        {podeCadastrarUsuarios ? (
                            <Link className="layout__link" to="/admin/gerenciamento">
                                Gerenciamento
                            </Link>
                        ) : null}
                        <button className="botao botao--secundario" type="button" onClick={aoSair}>
                            Sair
                        </button>
                    </div>
                ) : null}
            </header>

            <main
                className={
                    variante === 'aberta' ? 'layout__conteudo layout__conteudo--aberto' : 'layout__conteudo'
                }
            >
                <section className={classesCartao}>
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
