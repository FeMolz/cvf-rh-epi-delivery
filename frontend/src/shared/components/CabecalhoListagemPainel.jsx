/**
 * @param {{
 *   icone: import('react').ReactNode,
 *   titulo: string,
 *   descricao: string,
 *   acoes?: import('react').ReactNode
 * }} props
 */
export function CabecalhoListagemPainel({ icone, titulo, descricao, acoes }) {
    return (
        <>
            <header className="gerenciamento-painel__cabecalho listagem-painel__cabecalho">
                <div className="listagem-painel__identidade">
                    <span className="gerenciamento-painel__icone" aria-hidden>
                        {icone}
                    </span>
                    <div>
                        <h2>{titulo}</h2>
                        <p>{descricao}</p>
                    </div>
                </div>
                {acoes ? <div className="listagem-painel__acoes-cabecalho">{acoes}</div> : null}
            </header>
            <hr className="listagem-painel__separador" aria-hidden="true" />
        </>
    );
}
