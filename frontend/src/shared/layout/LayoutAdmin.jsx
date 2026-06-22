import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { LogoSistema, NOME_SISTEMA } from '../components/LogoSistema.jsx';
import { IconeModulo } from '../components/IconeModulo.jsx';
import { useAuth } from '../auth/useAuth.js';
import { listarModulosVisiveis } from '../constants/modulosSistema.js';
import { ROTULOS_PAPEIS } from '../constants/papeis.js';
import '../../modules/usuarios/components/layout-aplicacao.css';
import './layout-admin.css';

export function LayoutAdmin() {
    const { user, logout } = useAuth();
    const navegar = useNavigate();
    const modulos = listarModulosVisiveis(user?.role);

    useEffect(() => {
        document.title = NOME_SISTEMA;
    }, []);

    async function aoSair() {
        await logout();
        navegar('/login');
    }

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar" aria-label="Navegação principal">
                <div className="admin-sidebar__marca">
                    <LogoSistema className="logo-sistema--sidebar" />
                </div>

                <nav className="admin-sidebar__nav">
                    <ul className="admin-sidebar__lista">
                        {modulos.map((modulo) => (
                            <li key={modulo.id}>
                                {modulo.rota && !modulo.emBreve ? (
                                    <NavLink
                                        to={modulo.rota}
                                        end={modulo.rotaExata === true}
                                        className={({ isActive }) =>
                                            `admin-sidebar__link${isActive ? ' admin-sidebar__link--ativo' : ''}`
                                        }
                                    >
                                        <IconeModulo id={modulo.id} />
                                        <span className="admin-sidebar__rotulo">{modulo.rotulo}</span>
                                    </NavLink>
                                ) : (
                                    <span className="admin-sidebar__link admin-sidebar__link--desabilitado">
                                        <IconeModulo id={modulo.id} />
                                        <span className="admin-sidebar__rotulo">{modulo.rotulo}</span>
                                        <small>Em breve</small>
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="admin-sidebar__rodape">
                    <div className="admin-sidebar__usuario">
                        <span>{user?.name}</span>
                        <small>{ROTULOS_PAPEIS[user?.role] || user?.role}</small>
                    </div>
                    <button className="botao botao--secundario botao--bloco" type="button" onClick={aoSair}>
                        Sair
                    </button>
                </div>
            </aside>

            <div className="admin-conteudo">
                <Outlet />
            </div>
        </div>
    );
}
