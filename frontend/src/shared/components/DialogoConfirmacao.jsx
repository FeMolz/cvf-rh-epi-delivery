import './dialogo-confirmacao.css';

/**
 * @param {{
 *   aberto: boolean,
 *   titulo: string,
 *   mensagem: string,
 *   rotuloConfirmar?: string,
 *   rotuloCancelar?: string,
 *   rotuloCarregando?: string,
 *   classeBotaoConfirmar?: string,
 *   carregando?: boolean,
 *   exibirCancelar?: boolean,
 *   onConfirmar: () => void,
 *   onCancelar: () => void
 * }} props
 */
export function DialogoConfirmacao({
    aberto,
    titulo,
    mensagem,
    rotuloConfirmar = 'Confirmar',
    rotuloCancelar = 'Cancelar',
    rotuloCarregando = 'Excluindo…',
    classeBotaoConfirmar = 'botao botao--perigo',
    carregando = false,
    exibirCancelar = true,
    onConfirmar,
    onCancelar
}) {
    if (!aberto) {
        return null;
    }

    return (
        <div className="dialogo-confirmacao" role="presentation" onClick={onCancelar}>
            <div
                className="dialogo-confirmacao__cartao"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="dialogo-confirmacao-titulo"
                aria-describedby="dialogo-confirmacao-mensagem"
                onClick={(evento) => evento.stopPropagation()}
            >
                <h2 id="dialogo-confirmacao-titulo" className="dialogo-confirmacao__titulo">
                    {titulo}
                </h2>
                <p id="dialogo-confirmacao-mensagem" className="dialogo-confirmacao__mensagem">
                    {mensagem}
                </p>
                <div className="dialogo-confirmacao__acoes">
                    {exibirCancelar ? (
                        <button
                            className="botao botao--secundario"
                            type="button"
                            disabled={carregando}
                            onClick={onCancelar}
                        >
                            {rotuloCancelar}
                        </button>
                    ) : null}
                    <button
                        className={classeBotaoConfirmar}
                        type="button"
                        disabled={carregando}
                        onClick={onConfirmar}
                    >
                        {carregando ? rotuloCarregando : rotuloConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
}
