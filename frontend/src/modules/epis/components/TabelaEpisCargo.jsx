import {
    formatarDataValidadeEpi,
    normalizarVinculoEpiCargo,
    obterClasseStatusEpi,
    obterRotuloStatusEpi
} from '../utils/listagemEpis.js';

/**
 * @param {{
 *   vinculos: Array<Record<string, unknown>>,
 *   exibirAcoes?: boolean,
 *   processandoId?: string,
 *   onDesvincular?: (epiId: string) => void
 * }} props
 */
export function TabelaEpisCargo({
    vinculos,
    exibirAcoes = false,
    processandoId = '',
    onDesvincular
}) {
    if (!vinculos.length) {
        return <p className="estado-vazio">Nenhum EPI vinculado a este cargo.</p>;
    }

    return (
        <div className="listagem-painel__tabela">
            <table className="tabela-usuarios">
                <thead>
                    <tr>
                        <th>CA</th>
                        <th>Equipamento</th>
                        <th>Validade do CA</th>
                        <th>Periodicidade (dias)</th>
                        <th>Status</th>
                        {exibirAcoes ? <th>Ações</th> : null}
                    </tr>
                </thead>
                <tbody>
                    {vinculos.map((vinculo) => {
                        const item = normalizarVinculoEpiCargo(vinculo);

                        return (
                            <tr key={item.vinculoId || item.epiId}>
                                <td>{item.caNumber}</td>
                                <td>{item.name}</td>
                                <td>{formatarDataValidadeEpi(item.caExpirationDate)}</td>
                                <td>{item.periodicityDays}</td>
                                <td>
                                    <span className={obterClasseStatusEpi(item)}>
                                        {obterRotuloStatusEpi(item)}
                                    </span>
                                </td>
                                {exibirAcoes ? (
                                    <td>
                                        <button
                                            className="botao botao--secundario botao--compacto"
                                            type="button"
                                            disabled={processandoId === item.epiId}
                                            onClick={() => onDesvincular?.(item.epiId)}
                                        >
                                            {processandoId === item.epiId ? 'Removendo…' : 'Desvincular'}
                                        </button>
                                    </td>
                                ) : null}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
