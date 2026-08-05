import { useState } from 'react';

import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { normalizarTextoMaiusculo } from '../../../shared/utils/normalizarTextoMaiusculo.js';

/**
 * @param {{
 *   valoresIniciais?: { name?: string, description?: string },
 *   rotuloEnviar?: string,
 *   onSubmit: (dados: { name: string, description: string }) => Promise<void>,
 *   onCancelar?: () => void,
 *   linkVoltar?: import('react').ReactNode,
 *   acaoExcluir?: import('react').ReactNode,
 *   carregando?: boolean,
 *   somenteLeitura?: boolean
 * }} props
 */
export function FormularioCargo({
    valoresIniciais = {},
    rotuloEnviar = 'Salvar cargo',
    onSubmit,
    onCancelar,
    linkVoltar = null,
    acaoExcluir = null,
    carregando = false,
    somenteLeitura = false
}) {
    const [name, setName] = useState(valoresIniciais.name || '');
    const [description, setDescription] = useState(valoresIniciais.description || '');
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    async function aoEnviar(evento) {
        evento.preventDefault();

        if (somenteLeitura) {
            return;
        }

        setErro('');
        setSucesso('');

        try {
            await onSubmit({
                name: normalizarTextoMaiusculo(name),
                description: normalizarTextoMaiusculo(description)
            });
            setSucesso('Cargo salvo com sucesso.');

            if (!valoresIniciais.name) {
                setName('');
                setDescription('');
            }
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível salvar o cargo.');
        }
    }

    function limparErro() {
        setErro('');
    }

    function limparSucesso() {
        setSucesso('');
    }

    return (
        <form className="formulario" onSubmit={aoEnviar}>
            <AreaMensagensFeedback
                erro={erro}
                sucesso={sucesso}
                onLimparErro={limparErro}
                onLimparSucesso={limparSucesso}
            />

            <div className="campo">
                <label htmlFor="nome-cargo">Nome do cargo</label>
                <input
                    id="nome-cargo"
                    type="text"
                    value={name}
                    onChange={(evento) => setName(evento.target.value)}
                    placeholder="Ex.: Operador de empilhadeira"
                    required
                    readOnly={somenteLeitura}
                    disabled={somenteLeitura}
                />
            </div>

            <div className="campo">
                <label htmlFor="descricao-cargo">Descrição</label>
                <textarea
                    id="descricao-cargo"
                    value={description}
                    onChange={(evento) => setDescription(evento.target.value)}
                    placeholder="Atividades e responsabilidades do cargo"
                    rows={4}
                    required
                    readOnly={somenteLeitura}
                    disabled={somenteLeitura}
                />
            </div>

            {somenteLeitura && (linkVoltar || acaoExcluir) ? (
                <div className="detalhe-usuario__acoes">
                    <div
                        className={
                            acaoExcluir
                                ? 'detalhe-usuario__acoes-principais'
                                : 'detalhe-usuario__acoes-secundarias detalhe-usuario__acoes-secundarias--unica'
                        }
                    >
                        {acaoExcluir}
                        {!acaoExcluir ? linkVoltar : null}
                    </div>
                    {acaoExcluir && linkVoltar ? (
                        <div className="detalhe-usuario__acoes-secundarias">{linkVoltar}</div>
                    ) : null}
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
