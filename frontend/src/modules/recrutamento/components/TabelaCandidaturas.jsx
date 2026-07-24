import { DialogoConfirmacao } from '../../../shared/components/DialogoConfirmacao.jsx';
import { BadgeStatusCandidatura } from './BadgeStatusCandidatura.jsx';
import { SeletorStatusCandidatura } from './SeletorStatusCandidatura.jsx';

/**
 * @param {object} candidatura
 */
export function candidaturaComTagNovo(candidatura) {
    return !candidatura.descricaoVisualizadaEm && !candidatura.curriculoVisualizadoEm;
}

/**
 * @param {{
 *   candidaturas: Array<object>,
 *   modoLixeira?: boolean,
 *   exibirColunaVaga?: boolean,
 *   carregandoAcaoId?: string,
 *   candidaturaDetalhe?: object | null,
 *   onAbrirDetalhe?: (candidatura: object) => void,
 *   onFecharDetalhe?: () => void,
 *   onAlterarStatus: (candidaturaId: string, status: string) => void,
 *   onBaixarCurriculo: (candidaturaId: string) => void,
 *   onGerarConvite?: (candidaturaId: string) => void,
 *   onReativar?: (candidaturaId: string) => void
 * }} props
 */
export function TabelaCandidaturas({
    candidaturas,
    modoLixeira = false,
    exibirColunaVaga = false,
    carregandoAcaoId = '',
    candidaturaDetalhe = null,
    onAbrirDetalhe,
    onFecharDetalhe,
    onAlterarStatus,
    onBaixarCurriculo,
    onGerarConvite,
    onReativar
}) {
    if (!candidaturas.length) {
        return <p className="estado-vazio">Nenhuma candidatura encontrada.</p>;
    }

    const mensagemDetalhe = candidaturaDetalhe
        ? [
              `Pretensão salarial: ${candidaturaDetalhe.pretensaoSalarial || 'Não informada.'}`,
              '',
              candidaturaDetalhe.mensagemCandidato?.trim()
                  ? candidaturaDetalhe.mensagemCandidato.trim()
                  : 'Sem descrição enviada.'
          ].join('\n')
        : '';

    return (
        <>
            <div className="listagem-painel__tabela">
                <table className="tabela-usuarios">
                    <thead>
                        <tr>
                            <th>Candidato</th>
                            <th>E-mail</th>
                            {exibirColunaVaga ? <th>Vaga</th> : null}
                            <th>Status</th>
                            <th>Data</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidaturas.map((candidatura) => (
                            <tr key={candidatura.id}>
                                <td>
                                    <div className="tabela-candidaturas__candidato">
                                        <button
                                            className="tabela-candidaturas__nome-link"
                                            type="button"
                                            onClick={() => onAbrirDetalhe?.(candidatura)}
                                        >
                                            {candidatura.nomeCompleto}
                                        </button>
                                        {candidaturaComTagNovo(candidatura) ? (
                                            <span className="badge-candidatura-novo">NOVO</span>
                                        ) : null}
                                    </div>
                                </td>
                                <td>{candidatura.email}</td>
                                {exibirColunaVaga ? (
                                    <td>{candidatura.anuncioVaga?.tituloVaga || '—'}</td>
                                ) : null}
                                <td>
                                    <BadgeStatusCandidatura status={candidatura.status} />
                                </td>
                                <td>
                                    {candidatura.createdAt
                                        ? new Date(candidatura.createdAt).toLocaleDateString('pt-BR')
                                        : '—'}
                                </td>
                                <td className="tabela-candidaturas__acoes">
                                    {!modoLixeira && candidatura.curriculoNomeArquivo ? (
                                        <button
                                            className="botao botao--secundario botao--compacto"
                                            type="button"
                                            onClick={() => onBaixarCurriculo(candidatura.id)}
                                        >
                                            Currículo
                                        </button>
                                    ) : null}

                                    {modoLixeira && onReativar ? (
                                        <button
                                            className="botao botao--primario botao--compacto"
                                            type="button"
                                            disabled={carregandoAcaoId === candidatura.id}
                                            onClick={() => onReativar(candidatura.id)}
                                        >
                                            {carregandoAcaoId === candidatura.id
                                                ? 'Reativando…'
                                                : 'Reativar'}
                                        </button>
                                    ) : null}

                                    {!modoLixeira ? (
                                        <SeletorStatusCandidatura
                                            statusAtual={candidatura.status}
                                            desabilitado={carregandoAcaoId === candidatura.id}
                                            onAlterarStatus={(status) =>
                                                onAlterarStatus(candidatura.id, status)
                                            }
                                        />
                                    ) : null}

                                    {!modoLixeira &&
                                    onGerarConvite &&
                                    candidatura.status === 'PROXIMA_FASE' ? (
                                        <button
                                            className="botao botao--primario botao--compacto"
                                            type="button"
                                            disabled={carregandoAcaoId === candidatura.id}
                                            onClick={() => onGerarConvite(candidatura.id)}
                                        >
                                            Convite cadastro
                                        </button>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <DialogoConfirmacao
                aberto={Boolean(candidaturaDetalhe)}
                titulo={candidaturaDetalhe?.nomeCompleto || 'Candidatura'}
                mensagem={mensagemDetalhe}
                rotuloConfirmar="Ok"
                classeBotaoConfirmar="botao botao--primario"
                exibirCancelar={false}
                onCancelar={() => onFecharDetalhe?.()}
                onConfirmar={() => onFecharDetalhe?.()}
            />
        </>
    );
}
