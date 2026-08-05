import { Link } from 'react-router-dom';

import {
    obterClasseStatusFuncionario,
    obterNomeEmpresa,
    obterRotuloStatusFuncionario,
    formatarData
} from '../../funcionarios/utils/listagemFuncionarios.js';

/**
 * @param {{ funcionarios: Array<Record<string, unknown>> }} props
 */
export function TabelaFeriasFuncionarios({ funcionarios }) {
    if (funcionarios.length === 0) {
        return (
            <p className="estado-vazio">
                Nenhum funcionário em férias encontrado com os filtros aplicados.
            </p>
        );
    }

    return (
        <div className="listagem-painel__tabela">
            <table className="tabela-usuarios tabela-usuarios--ferias">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Empresa</th>
                        <th>Retorno previsto</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {funcionarios.map((funcionario) => (
                        <tr key={String(funcionario.id)}>
                            <td>
                                <Link
                                    className="usuario-link"
                                    to={`/admin/funcionarios/${funcionario.id}`}
                                >
                                    {String(funcionario.name || '—')}
                                </Link>
                            </td>
                            <td>{String(funcionario.cpf || '—')}</td>
                            <td>{obterNomeEmpresa(funcionario)}</td>
                            <td>{formatarData(funcionario.leaveReturnDate)}</td>
                            <td>
                                <span className={obterClasseStatusFuncionario(funcionario)}>
                                    {obterRotuloStatusFuncionario(funcionario.status)}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
