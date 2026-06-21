import { useState } from 'react';

import { PesquisaEpiPorNome } from './PesquisaEpiPorNome.jsx';

/**
 * @param {{
 *   cargos: Array<{ id: string, name: string }>,
 *   cargoSelecionadoId?: string,
 *   rotulo?: string,
 *   incluirOpcaoVazia?: boolean,
 *   opcaoVaziaRotulo?: string,
 *   onSelecionar: (cargoId: string) => void
 * }} props
 */
export function SeletorCargoEpis({
    cargos,
    cargoSelecionadoId = '',
    rotulo = 'Cargo',
    incluirOpcaoVazia = true,
    opcaoVaziaRotulo = 'Selecione um cargo…',
    onSelecionar
}) {
    return (
        <div className="campo epis-seletor-cargo">
            <label htmlFor="epis-cargo-selecionado">{rotulo}</label>
            <select
                id="epis-cargo-selecionado"
                value={cargoSelecionadoId}
                onChange={(evento) => onSelecionar(evento.target.value)}
            >
                {incluirOpcaoVazia ? <option value="">{opcaoVaziaRotulo}</option> : null}
                {cargos.map((cargo) => (
                    <option key={cargo.id} value={cargo.id}>
                        {cargo.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

/**
 * @param {{
 *   epis: Array<Record<string, unknown>>,
 *   processandoId?: string,
 *   onVincular: (caNumber: string, periodicityDays: number) => void
 * }} props
 */
export function TabelaEpisParaVinculo({ epis, processandoCaNumber = '', onVincular }) {
    const [periodicidades, setPeriodicidades] = useState({});

    function atualizarPeriodicidade(epiId, valor) {
        setPeriodicidades((atual) => ({ ...atual, [epiId]: valor }));
    }

    if (!epis.length) {
        return (
            <p className="estado-vazio">
                Nenhum EPI ativo em cache disponível para vincular a este cargo.
            </p>
        );
    }

    return (
        <div className="listagem-painel__tabela">
            <table className="tabela-usuarios">
                <thead>
                    <tr>
                        <th>CA</th>
                        <th>Equipamento</th>
                        <th>Validade do CA</th>
                        <th>Periodicidade (dias)</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody>
                    {epis.map((epi) => {
                        const epiId = String(epi.id);
                        const periodicidade = periodicidades[epiId] ?? '180';

                        return (
                            <tr key={epiId}>
                                <td>{epi.caNumber}</td>
                                <td>{epi.name}</td>
                                <td>{epi.caExpirationDate ? new Date(epi.caExpirationDate).toLocaleDateString('pt-BR') : '—'}</td>
                                <td>
                                    <input
                                        className="epis-campo-periodicidade"
                                        type="number"
                                        min="1"
                                        value={periodicidade}
                                        onChange={(evento) => atualizarPeriodicidade(epiId, evento.target.value)}
                                    />
                                </td>
                                <td>
                                    <button
                                        className="botao botao--primario botao--compacto"
                                        type="button"
                                        disabled={processandoCaNumber === String(epi.caNumber)}
                                        onClick={() => onVincular(String(epi.caNumber), Number(periodicidade))}
                                    >
                                        {processandoCaNumber === String(epi.caNumber) ? 'Vinculando…' : 'Vincular'}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

/**
 * @param {{
 *   token: string,
 *   carregando?: boolean,
 *   onConsultar: (caNumber: string, periodicityDays: number) => void
 * }} props
 */
export function FormularioVinculoEpiPorCa({ token, carregando = false, onConsultar }) {
    const [caNumber, setCaNumber] = useState('');
    const [periodicityDays, setPeriodicityDays] = useState('180');
    const [erro, setErro] = useState('');

    function aoEnviar(evento) {
        evento.preventDefault();
        setErro('');

        const caNormalizado = caNumber.trim();
        const periodicidade = Number(periodicityDays);

        if (!caNormalizado) {
            setErro('Informe o número do CA.');
            return;
        }

        if (!Number.isFinite(periodicidade) || periodicidade <= 0) {
            setErro('A periodicidade deve ser um número maior que zero.');
            return;
        }

        onConsultar(caNormalizado, periodicidade);
    }

    return (
        <div className="epis-vinculo-por-ca">
            <PesquisaEpiPorNome
                token={token}
                desabilitado={carregando}
                onSelecionarCa={setCaNumber}
            />

            <form className="formulario epis-formulario-ca" onSubmit={aoEnviar}>
                <div className="formulario__grade epis-formulario-ca__grade">
                    <div className="campo">
                        <label htmlFor="epi-ca-number">Número do CA</label>
                        <input
                            id="epi-ca-number"
                            type="text"
                            inputMode="numeric"
                            placeholder="Ex.: 11070"
                            value={caNumber}
                            onChange={(evento) => setCaNumber(evento.target.value)}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="epi-periodicity-days">Periodicidade (dias)</label>
                        <input
                            id="epi-periodicity-days"
                            type="number"
                            min="1"
                            value={periodicityDays}
                            onChange={(evento) => setPeriodicityDays(evento.target.value)}
                        />
                    </div>
                </div>

                {erro ? (
                    <p className="mensagem mensagem--erro" role="alert">
                        {erro}
                    </p>
                ) : null}

                <button className="botao botao--primario" type="submit" disabled={carregando}>
                    {carregando ? 'Consultando e vinculando…' : 'Vincular por CA'}
                </button>

                <p className="admin-pagina__subtitulo epis-formulario-ca__ajuda">
                    Se o CA não estiver em cache, o sistema consulta a base pública antes de vincular.
                </p>
            </form>
        </div>
    );
}
