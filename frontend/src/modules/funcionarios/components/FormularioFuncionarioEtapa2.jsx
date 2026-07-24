import { useState } from 'react';

/**
 * @param {{
 *   valoresIniciais?: Record<string, unknown>,
 *   onVoltar: () => void,
 *   onContinuar: (dados: Record<string, unknown>) => void,
 *   onFinalizar?: (dados: Record<string, unknown>) => void,
 *   carregando?: boolean,
 *   rotuloFinalizar?: string
 * }} props
 */
export function FormularioFuncionarioEtapa2({
    valoresIniciais = {},
    onVoltar,
    onContinuar,
    onFinalizar,
    carregando = false,
    rotuloFinalizar = 'Finalizar cadastro'
}) {
    const [dados, setDados] = useState({
        cep: String(valoresIniciais.cep || ''),
        logradouro: String(valoresIniciais.logradouro || ''),
        numeroEndereco: String(valoresIniciais.numeroEndereco || ''),
        complemento: String(valoresIniciais.complemento || ''),
        bairro: String(valoresIniciais.bairro || ''),
        cidade: String(valoresIniciais.cidade || ''),
        estado: String(valoresIniciais.estado || '')
    });

    function atualizarCampo(campo, valor) {
        setDados((atual) => ({ ...atual, [campo]: valor }));
    }

    function aoContinuar(evento) {
        evento.preventDefault();
        onContinuar(dados);
    }

    function aoFinalizar(evento) {
        evento.preventDefault();
        onFinalizar?.(dados);
    }

    return (
        <form className="formulario" onSubmit={aoContinuar}>
            <fieldset className="formulario__grupo">
                <legend>Endereço (opcional)</legend>

                <div className="formulario__grade">
                    <div className="campo">
                        <label htmlFor="funcionario-cep">CEP</label>
                        <input
                            id="funcionario-cep"
                            type="text"
                            value={dados.cep}
                            onChange={(evento) => atualizarCampo('cep', evento.target.value)}
                            placeholder="00000-000"
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="funcionario-estado">UF</label>
                        <input
                            id="funcionario-estado"
                            type="text"
                            maxLength={2}
                            value={dados.estado}
                            onChange={(evento) =>
                                atualizarCampo('estado', evento.target.value.toUpperCase())
                            }
                            placeholder="SP"
                        />
                    </div>

                    <div className="campo campo--largura-total">
                        <label htmlFor="funcionario-logradouro">Logradouro</label>
                        <input
                            id="funcionario-logradouro"
                            type="text"
                            value={dados.logradouro}
                            onChange={(evento) => atualizarCampo('logradouro', evento.target.value)}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="funcionario-numero">Número</label>
                        <input
                            id="funcionario-numero"
                            type="text"
                            value={dados.numeroEndereco}
                            onChange={(evento) => atualizarCampo('numeroEndereco', evento.target.value)}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="funcionario-complemento">Complemento</label>
                        <input
                            id="funcionario-complemento"
                            type="text"
                            value={dados.complemento}
                            onChange={(evento) => atualizarCampo('complemento', evento.target.value)}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="funcionario-bairro">Bairro</label>
                        <input
                            id="funcionario-bairro"
                            type="text"
                            value={dados.bairro}
                            onChange={(evento) => atualizarCampo('bairro', evento.target.value)}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="funcionario-cidade">Cidade</label>
                        <input
                            id="funcionario-cidade"
                            type="text"
                            value={dados.cidade}
                            onChange={(evento) => atualizarCampo('cidade', evento.target.value)}
                        />
                    </div>
                </div>
            </fieldset>

            <div className="formulario__acoes formulario__acoes--multiplas">
                <button
                    className="botao botao--secundario"
                    type="button"
                    disabled={carregando}
                    onClick={onVoltar}
                >
                    Voltar
                </button>
                {onFinalizar ? (
                    <button
                        className="botao botao--secundario"
                        type="button"
                        disabled={carregando}
                        onClick={aoFinalizar}
                    >
                        {carregando ? 'Salvando…' : rotuloFinalizar}
                    </button>
                ) : null}
                <button className="botao botao--primario" type="submit" disabled={carregando}>
                    Continuar para benefícios
                </button>
            </div>
        </form>
    );
}
