import { Link } from 'react-router-dom';

import { obterClasseStatusSetor, obterRotuloStatusSetor } from '../utils/listagemSetores.js';

/**
 * @param {{ setores: Array<Record<string, unknown>> }} props
 */
export function TabelaSetores({ setores }) {
    if (!setores.length) {
        return <p className="estado-vazio">Nenhum setor encontrado para os filtros aplicados.</p>;
    }

    return (
        <div className="listagem-painel__tabela">
            <table className="tabela-usuarios">
                <thead>
                    <tr>
                        <th>Setor</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {setores.map((setor) => (
                        <tr
                            key={String(setor.id)}
                            className={
                                setor.isActive === false ? 'tabela-usuarios__linha--inativa' : undefined
                            }
                        >
                            <td>
                                <Link className="usuario-link" to={`/admin/setores/${setor.id}`}>
                                    {setor.nome}
                                </Link>
                            </td>
                            <td>
                                <span className={obterClasseStatusSetor(setor)}>
                                    {obterRotuloStatusSetor(setor)}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
