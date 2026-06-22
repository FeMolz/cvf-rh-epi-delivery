import { Paginacao } from '../../usuarios/components/Paginacao.jsx';
import { formatarDataRelatorio, formatarPeriodoRelatorio } from '../utils/formatarPeriodoRelatorio.js';
import { ControlesStatusDocumento } from './ControlesStatusDocumento.jsx';

/**
 * @param {{
 *   relatorios: Array<Record<string, unknown>>,
 *   paginaAtual: number,
 *   totalPaginas: number,
 *   totalItens: number,
 *   podeEditarStatus?: boolean,
 *   relatorioProcessandoId?: string,
 *   relatorioBaixandoId?: string,
 *   relatoriosComDownload?: Set<string>,
 *   onPaginaAnterior: () => void,
 *   onProximaPagina: () => void,
 *   onAlterarStatus: (relatorioId: string, statusId: string) => void,
 *   onBaixarPdf: (relatorioId: string) => void
 * }} props
 */
export function TabelaRelatoriosEntrega({
    relatorios,
    paginaAtual,
    totalPaginas,
    totalItens,
    podeEditarStatus = false,
    relatorioProcessandoId = '',
    relatorioBaixandoId = '',
    relatoriosComDownload = new Set(),
    onPaginaAnterior,
    onProximaPagina,
    onAlterarStatus,
    onBaixarPdf
}) {
    if (!relatorios.length) {
        return <p className="estado-vazio">Nenhum relatório encontrado para os filtros selecionados.</p>;
    }

    return (
        <>
            <div className="listagem-painel__tabela">
                <table className="tabela-usuarios">
                    <thead>
                        <tr>
                            <th>Emissão</th>
                            <th>Funcionário</th>
                            <th>Cargo</th>
                            <th>Período do relatório</th>
                            <th>Status do documento</th>
                            <th>Emitido por</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {relatorios.map((relatorio) => {
                            const id = String(relatorio.id);
                            const funcionario = /** @type {{ name?: string, role?: { name?: string } }} */ (
                                relatorio.employee || {}
                            );
                            const gerador = /** @type {{ name?: string }} */ (relatorio.generatedBy || {});
                            const processandoLinha = relatorioProcessandoId === id;
                            const baixandoLinha = relatorioBaixandoId === id;

                            return (
                                <tr key={id}>
                                    <td>{formatarDataRelatorio(relatorio.createdAt)}</td>
                                    <td>{funcionario.name || '—'}</td>
                                    <td>{funcionario.role?.name || '—'}</td>
                                    <td>
                                        {formatarPeriodoRelatorio(
                                            relatorio.periodStartDate,
                                            relatorio.periodEndDate
                                        )}
                                    </td>
                                    <td>
                                        <ControlesStatusDocumento
                                            relatorio={relatorio}
                                            podeEditar={podeEditarStatus}
                                            processando={processandoLinha}
                                            relatoriosComDownload={relatoriosComDownload}
                                            onAlterarStatus={(statusId) => onAlterarStatus(id, statusId)}
                                        />
                                    </td>
                                    <td>{gerador.name || '—'}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="botao botao--secundario botao--compacto"
                                            disabled={baixandoLinha}
                                            onClick={() => onBaixarPdf(id)}
                                        >
                                            {baixandoLinha ? 'Baixando…' : 'Baixar PDF'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {totalPaginas > 1 ? (
                <Paginacao
                    paginaAtual={paginaAtual}
                    totalPaginas={totalPaginas}
                    totalItens={totalItens}
                    rotuloItens="relatório(s)"
                    onPaginaAnterior={onPaginaAnterior}
                    onProximaPagina={onProximaPagina}
                />
            ) : null}
        </>
    );
}
