import { Link } from 'react-router-dom';

import { STATUS_ANUNCIO_VAGA } from '../constants/recrutamentoConstantes.js';
import { BadgeStatusVaga } from './BadgeStatusVaga.jsx';
import { obterRotuloModoTrabalho, obterRotuloTipoContratacao } from '../utils/formatarRecrutamento.js';

/**
 * @param {{
 *   vagas: Array<object>,
 *   rotaBase?: string,
 *   onPublicarVaga?: (vagaId: string) => void,
 *   onEncerrarVaga?: (vagaId: string) => void,
 *   processandoVagaId?: string
 * }} props
 */
export function TabelaVagas({
    vagas,
    rotaBase = '/admin/recrutamento',
    onPublicarVaga,
    onEncerrarVaga,
    processandoVagaId = ''
}) {
    if (!vagas.length) {
        return <p className="estado-vazio">Nenhuma vaga encontrada para os filtros aplicados.</p>;
    }

    const exibirColunaAcoes = Boolean(onPublicarVaga || onEncerrarVaga);

    return (
        <div className="listagem-painel__tabela">
            <table className="tabela-usuarios">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Local</th>
                        <th>Modo</th>
                        <th>Contratação</th>
                        <th>Status</th>
                        {exibirColunaAcoes ? <th>Ações</th> : null}
                    </tr>
                </thead>
                <tbody>
                    {vagas.map((vaga) => (
                        <tr key={vaga.id}>
                            <td>
                                <Link className="usuario-link" to={`${rotaBase}/${vaga.id}`}>
                                    {vaga.tituloVaga}
                                </Link>
                            </td>
                            <td>{vaga.localTrabalho}</td>
                            <td>{obterRotuloModoTrabalho(vaga.modoTrabalho)}</td>
                            <td>{obterRotuloTipoContratacao(vaga.tipoContratacao)}</td>
                            <td>
                                <BadgeStatusVaga status={vaga.status} />
                            </td>
                            {exibirColunaAcoes ? (
                                <td className="tabela-vagas__acoes">
                                    {vaga.status === STATUS_ANUNCIO_VAGA.INATIVA && onPublicarVaga ? (
                                        <button
                                            className="botao botao--primario botao--compacto"
                                            type="button"
                                            disabled={processandoVagaId === vaga.id}
                                            onClick={() => onPublicarVaga(vaga.id)}
                                        >
                                            {processandoVagaId === vaga.id ? 'Publicando…' : 'Publicar'}
                                        </button>
                                    ) : null}

                                    {vaga.status === STATUS_ANUNCIO_VAGA.ATIVA && onEncerrarVaga ? (
                                        <button
                                            className="botao botao--perigo botao--compacto"
                                            type="button"
                                            disabled={processandoVagaId === vaga.id}
                                            onClick={() => onEncerrarVaga(vaga.id)}
                                        >
                                            {processandoVagaId === vaga.id ? 'Encerrando…' : 'Encerrar'}
                                        </button>
                                    ) : null}
                                </td>
                            ) : null}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
