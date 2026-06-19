const ITENS_POR_PAGINA_PADRAO = 10;

/**
 * @param {{
 *   paginaAtual: number,
 *   totalPaginas: number,
 *   totalItens: number,
 *   onPaginaAnterior: () => void,
 *   onProximaPagina: () => void
 * }} props
 */
export function Paginacao({
    paginaAtual,
    totalPaginas,
    totalItens,
    onPaginaAnterior,
    onProximaPagina
}) {
    return (
        <div className="paginacao">
            <span className="paginacao__info">
                Página {paginaAtual} de {totalPaginas} · {totalItens} usuário(s)
            </span>
            <div className="paginacao__acoes">
                <button
                    className="botao botao--secundario"
                    type="button"
                    disabled={paginaAtual <= 1}
                    onClick={onPaginaAnterior}
                >
                    Anterior
                </button>
                <button
                    className="botao botao--secundario"
                    type="button"
                    disabled={paginaAtual >= totalPaginas}
                    onClick={onProximaPagina}
                >
                    Próxima
                </button>
            </div>
        </div>
    );
}

export { ITENS_POR_PAGINA_PADRAO };
