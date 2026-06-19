import { Link } from 'react-router-dom';

import { ROTULOS_PAPEIS } from '../../../shared/constants/papeis.js';
import { formatarDataHora } from '../../../shared/utils/listagemUsuarios.js';

/**
 * @param {{ usuarios: Array<Record<string, unknown>> }} props
 */
export function TabelaUsuariosDashboard({ usuarios }) {
    if (!usuarios.length) {
        return <p className="estado-vazio">Nenhum usuário encontrado para os filtros aplicados.</p>;
    }

    return (
        <div className="listagem-painel__tabela dashboard-painel__tabela">
            <table className="tabela-usuarios">
                <thead>
                    <tr>
                        <th>Usuário</th>
                        <th>E-mail</th>
                        <th>Permissão</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((usuario) => {
                        const iniciais = String(usuario.name || '?')
                            .split(' ')
                            .slice(0, 2)
                            .map((parte) => parte[0])
                            .join('')
                            .toUpperCase();

                        return (
                            <tr key={String(usuario.id)}>
                                <td>
                                    <Link className="usuario-link" to={`/admin/usuarios/${usuario.id}`}>
                                        <span className="usuario-avatar" aria-hidden="true">
                                            {iniciais}
                                        </span>
                                        {usuario.name}
                                    </Link>
                                </td>
                                <td>{usuario.email}</td>
                                <td>{ROTULOS_PAPEIS[usuario.role] || usuario.role}</td>
                                <td>
                                    {usuario.isActive ? (
                                        <span className="status-badge status-badge--online">Online</span>
                                    ) : (
                                        <span className="status-badge status-badge--offline">
                                            Offline · {formatarDataHora(usuario.lastLogin)}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
