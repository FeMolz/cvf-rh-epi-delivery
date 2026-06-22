import { useEffect, useMemo, useState } from 'react';

import { paginarLista } from '../../../shared/utils/listagemUsuarios.js';
import { Paginacao } from '../../usuarios/components/Paginacao.jsx';
import { ITENS_POR_PAGINA_EPI } from '../constants/paginacaoEntregasEpi.js';
import {
    formatarDataEntregaEpi,
    obterClasseSituacaoEpi,
    obterRotuloSituacaoEpi
} from '../utils/situacaoEntregaEpi.js';

/**
 * @param {{
 *   epis: Array<Record<string, unknown>>,
 *   nomeFuncionario?: string
 * }} props
 */
export function TabelaEpisFuncionarioEntrega({ epis, nomeFuncionario = '' }) {
    const [pagina, setPagina] = useState(1);

    useEffect(() => {
        setPagina(1);
    }, [epis.length, nomeFuncionario]);

    const paginacao = useMemo(
        () => paginarLista(epis, pagina, ITENS_POR_PAGINA_EPI),
        [epis, pagina]
    );

    if (!epis.length) {
        return (
            <p className="estado-vazio">
                {nomeFuncionario
                    ? `Nenhum EPI vinculado ao cargo de ${nomeFuncionario}.`
                    : 'Nenhum EPI vinculado ao cargo deste funcionário.'}
            </p>
        );
    }

    return (
        <>
            <div className="listagem-painel__tabela">
                <table className="tabela-usuarios">
                    <thead>
                        <tr>
                            <th>CA</th>
                            <th>Equipamento</th>
                            <th>Validade do CA</th>
                            <th>Última entrega</th>
                            <th>Próximo vencimento</th>
                            <th>Situação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginacao.itens.map((epi) => (
                            <tr key={String(epi.epiId)}>
                                <td>{epi.caNumber}</td>
                                <td>{epi.name}</td>
                                <td>{formatarDataEntregaEpi(epi.caExpirationDate)}</td>
                                <td>{formatarDataEntregaEpi(epi.lastDeliveryDate)}</td>
                                <td>{formatarDataEntregaEpi(epi.nextDueDate)}</td>
                                <td>
                                    <span className={obterClasseSituacaoEpi(String(epi.situacao))}>
                                        {obterRotuloSituacaoEpi(String(epi.situacao))}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {paginacao.totalItens > ITENS_POR_PAGINA_EPI ? (
                <Paginacao
                    paginaAtual={paginacao.paginaAtual}
                    totalPaginas={paginacao.totalPaginas}
                    totalItens={paginacao.totalItens}
                    rotuloItens="EPI(s)"
                    onPaginaAnterior={() => setPagina((atual) => Math.max(1, atual - 1))}
                    onProximaPagina={() =>
                        setPagina((atual) => Math.min(paginacao.totalPaginas, atual + 1))
                    }
                />
            ) : null}
        </>
    );
}
