import {
    formatarDataValidadeEpi,
    obterClasseStatusEpi,
    obterRotuloStatusEpi
} from '../utils/listagemEpis.js';

/**
 * @param {{ epis: Array<Record<string, unknown>> }} props
 */
export function TabelaEpis({ epis }) {
    if (!epis.length) {
        return <p className="estado-vazio">Nenhum EPI encontrado para os filtros aplicados.</p>;
    }

    return (
        <div className="listagem-painel__tabela">
            <table className="tabela-usuarios">
                <thead>
                    <tr>
                        <th>CA</th>
                        <th>Equipamento</th>
                        <th>Validade do CA</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {epis.map((epi) => (
                        <tr
                            key={String(epi.id)}
                            className={epi.isActive === false ? 'tabela-usuarios__linha--inativa' : undefined}
                        >
                            <td>{epi.caNumber}</td>
                            <td>{epi.name}</td>
                            <td>{formatarDataValidadeEpi(epi.caExpirationDate)}</td>
                            <td>
                                <span className={obterClasseStatusEpi(epi)}>{obterRotuloStatusEpi(epi)}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
