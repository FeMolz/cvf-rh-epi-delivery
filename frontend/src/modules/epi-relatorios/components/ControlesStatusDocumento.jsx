import {
    STATUS_DOCUMENTO_OPCOES,
    documentoLiberadoParaAlterarStatus,
    obterClasseResumoStatusDocumento,
    obterClasseSelectStatusDocumento,
    obterRotuloResumoStatusDocumento,
    obterStatusAtualDocumento
} from '../utils/statusDocumentoRelatorio.js';

/**
 * @param {{
 *   relatorio: { id: string, foiImpresso?: boolean, foiEncaminhado?: boolean, foiAssinado?: boolean },
 *   podeEditar?: boolean,
 *   processando?: boolean,
 *   relatoriosComDownload?: Set<string>,
 *   onAlterarStatus: (statusId: string) => void
 * }} props
 */
export function ControlesStatusDocumento({
    relatorio,
    podeEditar = false,
    processando = false,
    relatoriosComDownload = new Set(),
    onAlterarStatus
}) {
    const statusAtual = obterStatusAtualDocumento(relatorio);
    const liberado = documentoLiberadoParaAlterarStatus(relatorio, relatoriosComDownload);
    const selectHabilitado = podeEditar && liberado && !processando;

    if (!podeEditar) {
        return (
            <span className={obterClasseResumoStatusDocumento(relatorio)}>
                {obterRotuloResumoStatusDocumento(relatorio)}
            </span>
        );
    }

    return (
        <div className="epi-relatorios__status-documento">
            <select
                className={obterClasseSelectStatusDocumento(statusAtual)}
                value={statusAtual}
                disabled={!selectHabilitado}
                title={
                    liberado
                        ? 'Alterar status do documento'
                        : 'Baixe o PDF para liberar a alteração de status'
                }
                aria-label="Status do documento"
                onChange={(evento) => onAlterarStatus(evento.target.value)}
            >
                {STATUS_DOCUMENTO_OPCOES.map((opcao) => (
                    <option key={opcao.id} value={opcao.id}>
                        {opcao.rotulo}
                    </option>
                ))}
            </select>

            {!liberado ? (
                <span className="epi-relatorios__status-aviso">Baixe o PDF para alterar</span>
            ) : null}
        </div>
    );
}
