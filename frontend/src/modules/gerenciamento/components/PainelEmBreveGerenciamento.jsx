import { IconeAbaGerenciamento } from './IconeAbaGerenciamento.jsx';

/**
 * @param {{ id: string, rotulo: string, descricao?: string }} props
 */
export function PainelEmBreveGerenciamento({ id, rotulo, descricao }) {
    return (
        <section className="gerenciamento-painel">
            <header className="gerenciamento-painel__cabecalho">
                <span className="gerenciamento-painel__icone" aria-hidden>
                    <IconeAbaGerenciamento id={id} />
                </span>
                <div>
                    <h2>{rotulo}</h2>
                    <p>{descricao || `Configurações de ${rotulo.toLowerCase()} em breve.`}</p>
                </div>
            </header>

            <div className="gerenciamento-painel__corpo">
                <p className="gerenciamento-painel__em-breve">Em breve</p>
            </div>
        </section>
    );
}
