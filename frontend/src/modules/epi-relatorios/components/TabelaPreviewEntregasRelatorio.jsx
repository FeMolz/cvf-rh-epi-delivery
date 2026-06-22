/**
 * @param {{
 *   carregando?: boolean,
 *   textoPeriodoReferencia?: string,
 *   funcionario?: { name?: string, roleName?: string, companyName?: string, setorName?: string },
 *   entregas?: Array<{ dataEntrega: string, nomeEquipamento: string, numeroCa: string }>
 * }} props
 */
export function TabelaPreviewEntregasRelatorio({
    carregando = false,
    textoPeriodoReferencia = '',
    funcionario,
    entregas = []
}) {
    if (carregando) {
        return <p className="estado-carregando epi-relatorios__preview-estado">Carregando prévia das entregas…</p>;
    }

    if (!funcionario?.name) {
        return (
            <p className="estado-vazio epi-relatorios__preview-estado">
                Selecione o funcionário e o período para visualizar as entregas que constarão no PDF.
            </p>
        );
    }

    return (
        <section className="epi-relatorios__preview" aria-live="polite">
            <header className="epi-relatorios__preview-cabecalho">
                <h3>Prévia do relatório</h3>
                <p>
                    <strong>{funcionario.name}</strong>
                    {funcionario.roleName ? ` — ${funcionario.roleName}` : ''}
                    {textoPeriodoReferencia ? ` · Período: ${textoPeriodoReferencia}` : ''}
                </p>
                {funcionario.companyName || funcionario.setorName ? (
                    <p className="epi-relatorios__preview-meta">
                        {[funcionario.companyName, funcionario.setorName].filter(Boolean).join(' · ')}
                    </p>
                ) : null}
            </header>

            {!entregas.length ? (
                <p className="estado-vazio epi-relatorios__preview-corpo">Nenhuma entrega de EPI encontrada neste período.</p>
            ) : (
                <div className="epi-relatorios__preview-corpo">
                    <div className="listagem-painel__tabela epi-relatorios__preview-tabela">
                    <table className="tabela-usuarios">
                        <thead>
                            <tr>
                                <th>Data da entrega</th>
                                <th>Equipamento</th>
                                <th>CA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entregas.map((entrega, indice) => (
                                <tr key={`${entrega.numeroCa}-${entrega.dataEntrega}-${indice}`}>
                                    <td>{entrega.dataEntrega}</td>
                                    <td>{entrega.nomeEquipamento}</td>
                                    <td>{entrega.numeroCa}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}
        </section>
    );
}
