import { Link } from 'react-router-dom';

import {
    formatarData,
    obterQuantidadeEpis,
    obterRotuloStatusCargo
} from '../../cargos/utils/listagemCargos.js';

/**
 * @param {{ cargos: Array<Record<string, unknown>> }} props
 */
export function TabelaCargosDashboard({ cargos }) {
    if (!cargos.length) {
        return <p className="estado-vazio">Nenhum cargo encontrado para os filtros aplicados.</p>;
    }

    return (
        <div className="painel__tabela">
            <table className="tabela-usuarios">
                <thead>
                    <tr>
                        <th>Cargo</th>
                        <th>Descrição</th>
                        <th>Status</th>
                        <th>Criado em</th>
                        <th>EPIs</th>
                    </tr>
                </thead>
                <tbody>
                    {cargos.map((cargo) => {
                        const ativo = obterRotuloStatusCargo(cargo) === 'Ativo';

                        return (
                            <tr
                                key={String(cargo.id)}
                                className={ativo ? undefined : 'tabela-usuarios__linha--inativa'}
                            >
                                <td>
                                    <Link className="usuario-link" to={`/admin/cargos/${cargo.id}`}>
                                        {cargo.name}
                                    </Link>
                                </td>
                                <td>{cargo.description}</td>
                                <td>
                                    <span
                                        className={`status-badge ${
                                            ativo ? 'status-badge--online' : 'status-badge--offline'
                                        }`}
                                    >
                                        {obterRotuloStatusCargo(cargo)}
                                    </span>
                                </td>
                                <td>{formatarData(cargo.createdAt)}</td>
                                <td>{obterQuantidadeEpis(cargo)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
