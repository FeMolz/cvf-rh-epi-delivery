import { TabelaAniversariantes } from './TabelaAniversariantes.jsx';

const COLUNAS_SAINDO = [
    { id: 'nome', rotulo: 'Nome' },
    { id: 'empresa', rotulo: 'Empresa' },
    { id: 'situacao', rotulo: 'Situação' },
    { id: 'previsaoRetorno', rotulo: 'Previsão de volta' }
];

const COLUNAS_VOLTANDO = [
    { id: 'nome', rotulo: 'Nome' },
    { id: 'empresa', rotulo: 'Empresa' },
    { id: 'situacao', rotulo: 'Situação' },
    { id: 'dataRetorno', rotulo: 'Data de retorno' }
];

/**
 * @param {{
 *   mesReferencia?: string,
 *   saindo: Array<Record<string, string>>,
 *   voltando: Array<Record<string, string>>
 * }} props
 */
export function PainelAfastamentoNoticias({ mesReferencia = '', saindo, voltando }) {
    return (
        <>
            <p className="admin-pagina__subtitulo noticias-painel-descricao">
                Acompanhamento de afastamentos temporários (férias e licenças) com previsão de
                retorno.
                {mesReferencia ? ` Referência: ${mesReferencia}.` : ''}
            </p>

            <div className="noticias-grade">
                <TabelaAniversariantes
                    titulo="Quem está saindo"
                    colunas={COLUNAS_SAINDO}
                    itens={saindo}
                    campoVazio="Nenhum funcionário em afastamento fora do retorno previsto neste mês."
                />
                <TabelaAniversariantes
                    titulo="Quem está voltando"
                    colunas={COLUNAS_VOLTANDO}
                    itens={voltando}
                    campoVazio="Nenhum retorno previsto para o mês atual."
                />
            </div>
        </>
    );
}
