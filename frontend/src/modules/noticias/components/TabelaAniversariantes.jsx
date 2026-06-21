/**
 * @param {{ titulo: string, colunas: Array<{ id: string, rotulo: string }>, itens: Array<Record<string, string>>, campoVazio?: string }} props
 */
export function TabelaAniversariantes({ titulo, colunas, itens, campoVazio = 'Nenhum registro para o mês atual.' }) {
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
                                <tr key={item.id}>
                                    {colunas.map((coluna) => (
                                        <td key={`${item.id}-${coluna.id}`}>{item[coluna.id]}</td>
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
