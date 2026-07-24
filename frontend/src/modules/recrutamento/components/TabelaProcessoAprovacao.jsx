import { Link } from 'react-router-dom';

import {
    ROTULOS_STATUS_CADASTRO_CONTRATACAO,
    STATUS_CADASTRO_CONTRATACAO
} from '../constants/recrutamentoConstantes.js';

/**
 * @param {{
 *   cadastros: Array<object>,
 *   carregandoAcaoId?: string,
 *   onReenviarEmail?: (cadastroId: string) => void,
 *   onCancelarProcesso?: (cadastro: object) => void
 * }} props
 */
export function TabelaProcessoAprovacao({
    cadastros,
    carregandoAcaoId = '',
    onReenviarEmail,
    onCancelarProcesso
}) {
    if (!cadastros.length) {
        return <p className="estado-vazio">Nenhum cadastro em processo de aprovação.</p>;
    }

    return (
        <div className="listagem-painel__tabela">
            <table className="tabela-usuarios">
                <thead>
                    <tr>
                        <th>Candidato</th>
                        <th>E-mail</th>
                        <th>Vaga</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {cadastros.map((cadastro) => {
                        const nome =
                            cadastro.name ||
                            cadastro.candidatura?.nomeCompleto ||
                            '—';
                        const email = cadastro.email || cadastro.candidatura?.email || '—';
                        const vaga = cadastro.candidatura?.anuncioVaga?.tituloVaga || '—';
                        const aguardandoPreenchimento =
                            cadastro.status === STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO;
                        const aguardandoAnalise =
                            cadastro.status === STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH;
                        const podeCancelar =
                            (aguardandoPreenchimento || aguardandoAnalise) && onCancelarProcesso;

                        return (
                            <tr key={cadastro.id}>
                                <td>{nome}</td>
                                <td>{email}</td>
                                <td>{vaga}</td>
                                <td>
                                    <span className="badge-status">
                                        {ROTULOS_STATUS_CADASTRO_CONTRATACAO[cadastro.status] ||
                                            cadastro.status}
                                    </span>
                                </td>
                                <td className="tabela-candidaturas__acoes">
                                    {aguardandoPreenchimento && onReenviarEmail ? (
                                        <button
                                            className="botao botao--secundario botao--compacto"
                                            type="button"
                                            disabled={carregandoAcaoId === cadastro.id}
                                            onClick={() => onReenviarEmail(cadastro.id)}
                                        >
                                            {carregandoAcaoId === cadastro.id
                                                ? 'Reenviando…'
                                                : 'Reenviar e-mail'}
                                        </button>
                                    ) : null}

                                    {aguardandoAnalise ? (
                                        <Link
                                            className="botao botao--primario botao--compacto"
                                            to={`/admin/recrutamento/cadastros/${cadastro.id}/validar`}
                                        >
                                            Validar
                                        </Link>
                                    ) : null}

                                    {podeCancelar ? (
                                        <button
                                            className="botao-cancelar-processo"
                                            type="button"
                                            title="Cancelar processo"
                                            aria-label="Cancelar processo"
                                            disabled={carregandoAcaoId === cadastro.id}
                                            onClick={() => onCancelarProcesso(cadastro)}
                                        >
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                aria-hidden="true"
                                            >
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    ) : null}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
