import { Link } from 'react-router-dom';

import { formatarData, obterQuantidadeEpis } from '../utils/listagemCargos.js';

/**
 * @param {{ cargos: Array<Record<string, unknown>> }} props
 */
export function TabelaCargos({ cargos }) {
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
                        <th>Criado em</th>
                        <th>EPIs</th>
                    </tr>
                </thead>
                <tbody>
                    {cargos.map((cargo) => (
                        <tr key={String(cargo.id)}>
                            <td>
                                <Link className="usuario-link" to={`/admin/cargos/${cargo.id}`}>
                                    {cargo.name}
                                </Link>
                            </td>
                            <td>{cargo.description}</td>
                            <td>{formatarData(cargo.createdAt)}</td>
                            <td>{obterQuantidadeEpis(cargo)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
