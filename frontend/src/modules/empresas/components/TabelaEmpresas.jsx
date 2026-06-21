import { Link } from 'react-router-dom';

import { obterClasseStatusEmpresa, obterRotuloStatusEmpresa } from '../utils/listagemEmpresas.js';

/**
 * @param {{ empresas: Array<Record<string, unknown>> }} props
 */
export function TabelaEmpresas({ empresas }) {
    if (!empresas.length) {
        return <p className="estado-vazio">Nenhuma empresa encontrada para os filtros aplicados.</p>;
    }

    return (
        <div className="listagem-painel__tabela">
            <table className="tabela-usuarios">
                <thead>
                    <tr>
                        <th>Empresa</th>
                        <th>CNPJ</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {empresas.map((empresa) => (
                        <tr
                            key={String(empresa.id)}
                            className={
                                empresa.isActive === false ? 'tabela-usuarios__linha--inativa' : undefined
                            }
                        >
                            <td>
                                <Link className="usuario-link" to={`/admin/empresas/${empresa.id}`}>
                                    {empresa.name}
                                </Link>
                            </td>
                            <td>{empresa.cnpj}</td>
                            <td>
                                <span className={obterClasseStatusEmpresa(empresa)}>
                                    {obterRotuloStatusEmpresa(empresa)}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
