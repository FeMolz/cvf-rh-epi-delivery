import { Link } from 'react-router-dom';

import {
    obterClasseStatusFuncionario,
    funcionarioContratoEncerrado,
    obterNomeCargo,
    obterNomeEmpresa,
    obterNomeSetor,
    obterRotuloStatusFuncionario
} from '../utils/listagemFuncionarios.js';

/**
 * @param {{
 *   funcionarios: Array<Record<string, unknown>>,
 *   idsSelecionados?: Set<string>,
 *   onAlternarSelecao?: (id: string) => void
 * }} props
 */
export function TabelaFuncionarios({
    funcionarios,
    idsSelecionados = new Set(),
    onAlternarSelecao
}) {
    const exibirSelecao = typeof onAlternarSelecao === 'function';

    if (!funcionarios.length) {
        return (
            <p className="estado-vazio">Nenhum funcionário encontrado para os filtros aplicados.</p>
        );
    }

    return (
        <div className="listagem-painel__tabela">
            <table className="tabela-usuarios">
                <thead>
                    <tr>
                        {exibirSelecao ? (
                            <th className="tabela-usuarios__coluna-selecao">
                                <span className="visually-hidden">Selecionar</span>
                            </th>
                        ) : null}
                        <th>Nome</th>
                        <th>Cargo</th>
                        <th>Empresa</th>
                        <th>Setor</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {funcionarios.map((funcionario) => {
                        const encerrado = funcionarioContratoEncerrado(funcionario);
                        const id = String(funcionario.id);
                        const selecionado = idsSelecionados.has(id);

                        return (
                            <tr
                                key={id}
                                className={encerrado ? 'tabela-usuarios__linha--inativa' : undefined}
                            >
                                {exibirSelecao ? (
                                    <td className="tabela-usuarios__coluna-selecao">
                                        <label className="tabela-usuarios__selecao">
                                            <span className="visually-hidden">
                                                Selecionar {funcionario.name}
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={selecionado}
                                                onChange={() => onAlternarSelecao(id)}
                                            />
                                        </label>
                                    </td>
                                ) : null}
                                <td>
                                    <Link
                                        className="usuario-link"
                                        to={`/admin/funcionarios/${funcionario.id}`}
                                    >
                                        {funcionario.name}
                                    </Link>
                                </td>
                                <td>{obterNomeCargo(funcionario)}</td>
                                <td>{obterNomeEmpresa(funcionario)}</td>
                                <td>{obterNomeSetor(funcionario)}</td>
                                <td>
                                    <span className={obterClasseStatusFuncionario(funcionario)}>
                                        {obterRotuloStatusFuncionario(funcionario)}
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
