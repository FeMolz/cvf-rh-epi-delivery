import { useEffect, useMemo, useState } from 'react';

import { paginarLista } from '../../../shared/utils/listagemUsuarios.js';
import { Paginacao } from '../../usuarios/components/Paginacao.jsx';
import { ITENS_POR_PAGINA_EPI } from '../constants/paginacaoEntregasEpi.js';
import { formatarDataEntregaEpi } from '../utils/situacaoEntregaEpi.js';

/**
 * @param {{
 *   itens: Array<Record<string, unknown>>,
 *   processandoChave?: string,
 *   onEntregarRapido: (employeeId: string, caNumber: string) => void
 * }} props
 */
export function TabelaEpisVencidos({ itens, processandoChave = '', onEntregarRapido }) {
    const [pagina, setPagina] = useState(1);

    useEffect(() => {
        setPagina(1);
    }, [itens.length]);

    const paginacao = useMemo(
        () => paginarLista(itens, pagina, ITENS_POR_PAGINA_EPI),
        [itens, pagina]
    );

    if (!itens.length) {
        return <p className="estado-vazio">Nenhum funcionário com EPI vencido no momento.</p>;
    }

    return (
        <>
            <div className="listagem-painel__tabela">
                <table className="tabela-usuarios">
                    <thead>
                        <tr>
                            <th>Funcionário</th>
                            <th>Equipamento</th>
                            <th>CA</th>
                            <th>Venceu em</th>
                            <th aria-label="Entrega rápida" />
                        </tr>
                    </thead>
                    <tbody>
                        {paginacao.itens.map((item) => {
                            const chave = `${item.employeeId}-${item.caNumber}`;
                            const processando = processandoChave === chave;

                            return (
                                <tr key={chave}>
                                    <td>{item.employeeName}</td>
                                    <td>{item.epiName}</td>
                                    <td>{item.caNumber}</td>
                                    <td>{formatarDataEntregaEpi(item.nextDueDate)}</td>
                                    <td className="entregas-epi__acao-rapida">
                                        <button
                                            type="button"
                                            className="botao botao--icone entregas-epi__botao-mais"
                                            title="Registrar entrega (renovação)"
                                            disabled={processando}
                                            onClick={() =>
                                                onEntregarRapido(
                                                    String(item.employeeId),
                                                    String(item.caNumber)
                                                )
                                            }
                                        >
                                            {processando ? '…' : '+'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {paginacao.totalItens > ITENS_POR_PAGINA_EPI ? (
                <Paginacao
                    paginaAtual={paginacao.paginaAtual}
                    totalPaginas={paginacao.totalPaginas}
                    totalItens={paginacao.totalItens}
                    rotuloItens="registro(s)"
                    onPaginaAnterior={() => setPagina((atual) => Math.max(1, atual - 1))}
                    onProximaPagina={() =>
                        setPagina((atual) => Math.min(paginacao.totalPaginas, atual + 1))
                    }
                />
            ) : null}
        </>
    );
}
