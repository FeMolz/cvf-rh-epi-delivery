import { useEffect, useState } from 'react';

import { aplicarMascaraCnpj } from '../../../shared/utils/formatadoresBrasil.js';

/**
 * @param {{
 *   valoresIniciais?: { name?: string, cnpj?: string },
 *   rotuloEnviar?: string,
 *   onSubmit: (dados: { name: string, cnpj: string }) => Promise<void>,
 *   onCancelar?: () => void,
 *   linkVoltar?: import('react').ReactNode,
 *   acaoExcluir?: import('react').ReactNode,
 *   carregando?: boolean,
 *   somenteLeitura?: boolean
 * }} props
 */
export function FormularioEmpresa({
    valoresIniciais = {},
    rotuloEnviar = 'Salvar empresa',
    onSubmit,
    onCancelar,
    linkVoltar = null,
    acaoExcluir = null,
    carregando = false,
    somenteLeitura = false
}) {
    const [name, setName] = useState(valoresIniciais.name || '');
    const [cnpj, setCnpj] = useState(valoresIniciais.cnpj || '');
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
            await onSubmit({ name: name.trim(), cnpj: cnpj.trim() });
            setSucesso('Empresa salva com sucesso.');

            if (!valoresIniciais.name) {
                setName('');
                setCnpj('');
            }
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível salvar a empresa.');
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
                <label htmlFor="nome-empresa">Nome da empresa</label>
                <input
                    id="nome-empresa"
                    type="text"
                    value={name}
                    onChange={(evento) => setName(evento.target.value)}
                    placeholder="Ex.: Empresa 01 - Matriz"
                    required
                    readOnly={somenteLeitura}
                    disabled={somenteLeitura}
                />
            </div>

            <div className="campo">
                <label htmlFor="cnpj-empresa">CNPJ</label>
                <input
                    id="cnpj-empresa"
                    type="text"
                    inputMode="numeric"
                    value={cnpj}
                    onChange={(evento) => setCnpj(aplicarMascaraCnpj(evento.target.value))}
                    placeholder="00.000.000/0000-00"
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
