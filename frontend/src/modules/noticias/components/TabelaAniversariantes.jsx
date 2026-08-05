/**
 * @param {{
 *   titulo: string,
 *   colunas: Array<{ id: string, rotulo: string }>,
 *   itens: Array<Record<string, string | boolean>>,
 *   campoVazio?: string
 * }} props
 */
export function TabelaAniversariantes({ titulo, colunas, itens, campoVazio = 'Nenhum registro para o mês atual.' }) {
    function renderizarCelula(item, coluna) {
        const valor = item[coluna.id];

        if (coluna.id === 'nome' && item.ehHoje) {
            return <strong className="aniversariante-hoje">{String(valor || '—')}</strong>;
        }

        return String(valor ?? '—');
    }

    return (
        <section className="noticias-painel">
            <header className="noticias-painel__cabecalho">
                <h2>{titulo}</h2>
            </header>

            {!itens.length ? (
                <p className="estado-vazio">{campoVazio}</p>
            ) : (
                <div className="listagem-painel__tabela">
                    <table className="tabela-usuarios">
                        <thead>
                            <tr>
                                {colunas.map((coluna) => (
                                    <th key={coluna.id}>{coluna.rotulo}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {itens.map((item) => (
                                <tr
                                    key={String(item.id)}
                                    className={item.ehHoje ? 'tabela-usuarios__linha--destaque' : undefined}
                                >
                                    {colunas.map((coluna) => (
                                        <td key={`${item.id}-${coluna.id}`}>
                                            {renderizarCelula(item, coluna)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
