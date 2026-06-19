const ITENS_POR_PAGINA_PADRAO = 10;

/**
 * @param {{
 *   paginaAtual: number,
 *   totalPaginas: number,
 *   totalItens: number,
 *   onPaginaAnterior: () => void,
 *   onProximaPagina: () => void,
 *   rotuloItens?: string
 * }} props
 */
export function Paginacao({
    paginaAtual,
    totalPaginas,
    totalItens,
    onPaginaAnterior,
    onProximaPagina,
    rotuloItens = 'usuário(s)'
}) {
    return (
        <div className="paginacao">
            <span className="paginacao__info">
                Página {paginaAtual} de {totalPaginas} · {totalItens} {rotuloItens}
            </span>
            <div className="paginacao__acoes">
                <button
                    className="botao botao--primario botao--paginacao"
                    type="button"
                    disabled={paginaAtual <= 1}
                    onClick={onPaginaAnterior}
                >
                    Anterior
                </button>
                <button
                    className="botao botao--primario botao--paginacao"
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
