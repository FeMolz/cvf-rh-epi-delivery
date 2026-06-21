import { useEffect, useState } from 'react';

/**
 * @param {{
 *   valoresIniciais?: { nome?: string },
 *   rotuloEnviar?: string,
 *   onSubmit: (dados: { nome: string }) => Promise<void>,
 *   onCancelar?: () => void,
 *   linkVoltar?: import('react').ReactNode,
 *   acaoExcluir?: import('react').ReactNode,
 *   carregando?: boolean,
 *   somenteLeitura?: boolean
 * }} props
 */
export function FormularioSetor({
    valoresIniciais = {},
    rotuloEnviar = 'Salvar setor',
    onSubmit,
    onCancelar,
    linkVoltar = null,
    acaoExcluir = null,
    carregando = false,
    somenteLeitura = false
}) {
    const [nome, setNome] = useState(valoresIniciais.nome || '');
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    useEffect(() => {
        if (!sucesso) {
            return undefined;
        }

        const temporizador = setTimeout(() => {
            setSucesso('');
        }, 2000);

        return () => clearTimeout(temporizador);
    }, [sucesso]);

    useEffect(() => {
        if (!erro) {
            return undefined;
        }

        const temporizador = setTimeout(() => {
            setErro('');
        }, 2000);

        return () => clearTimeout(temporizador);
    }, [erro]);

    async function aoEnviar(evento) {
        evento.preventDefault();

        if (somenteLeitura) {
            return;
        }

        setErro('');
        setSucesso('');

        try {
            await onSubmit({ nome: nome.trim() });
            setSucesso('Setor salvo com sucesso.');

            if (!valoresIniciais.nome) {
                setNome('');
            }
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível salvar o setor.');
        }
    }

    return (
        <form className="formulario" onSubmit={aoEnviar}>
            {erro ? (
                <p className="mensagem mensagem--erro" role="alert">
                    {erro}
                </p>
            ) : null}

            {sucesso ? (
                <p className="mensagem mensagem--sucesso" role="status">
                    {sucesso}
                </p>
            ) : null}

            <div className="campo">
                <label htmlFor="nome-setor">Nome do setor</label>
                <input
                    id="nome-setor"
                    type="text"
                    value={nome}
                    onChange={(evento) => setNome(evento.target.value)}
                    placeholder="Ex.: ADMINISTRATIVO"
                    required
                    readOnly={somenteLeitura}
                    disabled={somenteLeitura}
                />
            </div>

            {somenteLeitura && linkVoltar ? (
                <div className="detalhe-usuario__acoes">
                    <div className="detalhe-usuario__acoes-secundarias detalhe-usuario__acoes-secundarias--unica">
                        {linkVoltar}
                    </div>
                </div>
            ) : null}

            {!somenteLeitura && (linkVoltar || acaoExcluir) ? (
                <div className="detalhe-usuario__acoes">
                    <div className="detalhe-usuario__acoes-principais">
                        <button className="botao botao--primario" type="submit" disabled={carregando}>
                            {carregando ? 'Salvando…' : rotuloEnviar}
                        </button>
                        {acaoExcluir}
                    </div>
                    {linkVoltar ? (
                        <div className="detalhe-usuario__acoes-secundarias">{linkVoltar}</div>
                    ) : null}
                </div>
            ) : !somenteLeitura ? (
                <div className="formulario__acoes">
                    <button className="botao botao--primario" type="submit" disabled={carregando}>
                        {carregando ? 'Salvando…' : rotuloEnviar}
                    </button>
                    {onCancelar ? (
                        <button className="botao botao--secundario" type="button" onClick={onCancelar}>
                            Cancelar
                        </button>
                    ) : null}
                </div>
            ) : null}
        </form>
    );
}
