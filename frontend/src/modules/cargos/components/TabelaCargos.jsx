import { Link } from 'react-router-dom';

import {
    cargoEstaAtivo,
    formatarData,
    obterClasseStatusCargo,
    obterQuantidadeEpis,
    obterRotuloStatusCargo
} from '../utils/listagemCargos.js';

/**
 * @param {{ cargos: Array<Record<string, unknown>> }} props
 */
export function TabelaCargos({ cargos }) {
    if (!cargos.length) {
        return <p className="estado-vazio">Nenhum cargo encontrado para os filtros aplicados.</p>;
    }

    return (
        <div className="listagem-painel__tabela">
            <table className="tabela-usuarios">
                <thead>
                    <tr>
                        <th>Cargo</th>
                        <th>Descrição</th>
                        <th>Criado em</th>
                        <th>EPIs</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {cargos.map((cargo) => {
                        const ativo = cargoEstaAtivo(cargo);

                        return (
                            <tr
                                key={String(cargo.id)}
                                className={!ativo ? 'tabela-usuarios__linha--inativa' : undefined}
                            >
                                <td>
                                    <Link className="usuario-link" to={`/admin/cargos/${cargo.id}`}>
                                        {cargo.name}
                                    </Link>
                                </td>
                                <td>{cargo.description}</td>
                                <td>{formatarData(cargo.createdAt)}</td>
                                <td>{obterQuantidadeEpis(cargo)}</td>
                                <td>
                                    <span className={obterClasseStatusCargo(cargo)}>
                                        {obterRotuloStatusCargo(cargo)}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
