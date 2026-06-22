import { useEffect, useMemo, useState } from 'react';

import { paginarLista } from '../../../shared/utils/listagemUsuarios.js';
import { Paginacao } from '../../usuarios/components/Paginacao.jsx';
import { ITENS_POR_PAGINA_EPI } from '../constants/paginacaoEntregasEpi.js';
import {
    obterClasseResumoEpisFuncionario,
    obterMensagemResumoEpisFuncionario
} from '../utils/resumoEpisFuncionario.js';

/**
 * @param {{
 *   funcionarios: Array<{
 *     id: string,
 *     name: string,
 *     roleName?: string,
 *     resumoEpis?: Record<string, number>
 *   }>,
 *   funcionarioSelecionadoId?: string,
 *   onSelecionar: (id: string) => void
 * }} props
 */
export function TabelaFuncionariosEpi({
    funcionarios,
    funcionarioSelecionadoId = '',
    onSelecionar
}) {
    const [pagina, setPagina] = useState(1);

    useEffect(() => {
        setPagina(1);
    }, [funcionarios.length]);

    const paginacao = useMemo(
        () => paginarLista(funcionarios, pagina, ITENS_POR_PAGINA_EPI),
        [funcionarios, pagina]
    );

    if (!funcionarios.length) {
        return <p className="estado-vazio">Nenhum funcionário ativo encontrado.</p>;
    }

    return (
        <>
            <div className="listagem-painel__tabela">
                <table className="tabela-usuarios">
                    <thead>
                        <tr>
                            <th>Funcionário</th>
                            <th>Cargo</th>
                            <th>Status dos EPIs</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginacao.itens.map((funcionario) => {
                            const ativo = funcionarioSelecionadoId === funcionario.id;
                            const resumo = funcionario.resumoEpis || {};

                            return (
                                <tr
                                    key={funcionario.id}
                                    className={ativo ? 'entregas-epi__linha--ativa' : ''}
                                >
                                    <td>
                                        <button
                                            type="button"
                                            className="entregas-epi__botao-linha"
                                            onClick={() => onSelecionar(funcionario.id)}
                                        >
                                            {funcionario.name}
                                        </button>
                                    </td>
                                    <td>{funcionario.roleName || '—'}</td>
                                    <td>
                                        <span className={obterClasseResumoEpisFuncionario(resumo)}>
                                            {obterMensagemResumoEpisFuncionario(resumo)}
                                        </span>
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
                    rotuloItens="funcionário(s)"
                    onPaginaAnterior={() => setPagina((atual) => Math.max(1, atual - 1))}
                    onProximaPagina={() =>
                        setPagina((atual) => Math.min(paginacao.totalPaginas, atual + 1))
                    }
                />
            ) : null}
        </>
    );
}
