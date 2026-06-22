import { TabelaAniversariantes } from '../components/TabelaAniversariantes.jsx';

const COLUNAS_ANIVERSARIO_PESSOAL = [
    { id: 'nome', rotulo: 'Nome' },
    { id: 'empresa', rotulo: 'Empresa' },
    { id: 'dataAniversario', rotulo: 'Data de aniversário' }
];

const COLUNAS_ANIVERSARIO_EMPRESA = [
    { id: 'nome', rotulo: 'Nome' },
    { id: 'empresa', rotulo: 'Empresa' },
    { id: 'tempoEmpresa', rotulo: 'Tempo de empresa' }
];

/**
 * @param {{
 *   mesReferencia?: string,
 *   aniversariantesPessoais: Array<Record<string, string>>,
 *   aniversariantesEmpresa: Array<Record<string, string>>
 * }} props
 */
export function PainelAniversarioNoticias({
    mesReferencia = '',
    aniversariantesPessoais,
    aniversariantesEmpresa
}) {
    return (
        <>
            <p className="admin-pagina__subtitulo noticias-painel-descricao">
                Aniversariantes do mês entre todos os funcionários ativos de todas as empresas.
                {mesReferencia ? ` Referência: ${mesReferencia}.` : ''}
            </p>

            <div className="noticias-grade">
                <TabelaAniversariantes
                    titulo="Aniversariantes pessoais"
                    colunas={COLUNAS_ANIVERSARIO_PESSOAL}
                    itens={aniversariantesPessoais}
                />
                <TabelaAniversariantes
                    titulo="Aniversariantes de tempo de empresa"
                    colunas={COLUNAS_ANIVERSARIO_EMPRESA}
                    itens={aniversariantesEmpresa}
                />
            </div>
        </>
    );
}
