import { useState } from 'react';

/**
 * @param {{
 *   valoresIniciais?: Record<string, unknown>,
 *   onVoltar: () => void,
 *   onFinalizar: (dados: Record<string, unknown>) => void,
 *   carregando?: boolean,
 *   rotuloFinalizar?: string
 * }} props
 */
export function FormularioFuncionarioEtapa3({
    valoresIniciais = {},
    onVoltar,
    onFinalizar,
    carregando = false,
    rotuloFinalizar = 'Finalizar cadastro'
}) {
    const [dados, setDados] = useState({
        valeTransporte: Boolean(valoresIniciais.valeTransporte),
        valeAlimentacao: Boolean(valoresIniciais.valeAlimentacao),
        planoSaude: Boolean(valoresIniciais.planoSaude)
    });

    function atualizarBeneficio(campo, marcado) {
        setDados((atual) => ({ ...atual, [campo]: marcado }));
    }

    function aoFinalizar(evento) {
        evento.preventDefault();
        onFinalizar(dados);
    }

    return (
        <form className="formulario" onSubmit={aoFinalizar}>
            <fieldset className="formulario__grupo">
                <legend>Benefícios</legend>

                <div className="formulario__beneficios">
                    <label className="filtro-fixo">
                        <input
                            type="checkbox"
                            checked={dados.valeTransporte}
                            onChange={(evento) =>
                                atualizarBeneficio('valeTransporte', evento.target.checked)
                            }
                        />
                        Vale transporte
                    </label>

                    <label className="filtro-fixo">
                        <input
                            type="checkbox"
                            checked={dados.valeAlimentacao}
                            onChange={(evento) =>
                                atualizarBeneficio('valeAlimentacao', evento.target.checked)
                            }
                        />
                        Vale alimentação
                    </label>

                    <label className="filtro-fixo">
                        <input
                            type="checkbox"
                            checked={dados.planoSaude}
                            onChange={(evento) =>
                                atualizarBeneficio('planoSaude', evento.target.checked)
                            }
                        />
                        Plano de saúde
                    </label>
                </div>
            </fieldset>

            <div className="formulario__acoes">
                <button
                    className="botao botao--secundario"
                    type="button"
                    disabled={carregando}
                    onClick={onVoltar}
                >
                    Voltar
                </button>
                <button className="botao botao--primario" type="submit" disabled={carregando}>
                    {carregando ? 'Salvando…' : rotuloFinalizar}
                </button>
            </div>
        </form>
    );
}
