import { IconeAbaGerenciamento } from './IconeAbaGerenciamento.jsx';

/**
 * @param {{
 *   abaAtiva: string,
 *   abas: Array<{ id: string, rotulo: string }>,
 *   onTrocarAba: (id: string) => void
 * }} props
 */
export function AbasGerenciamento({ abaAtiva, abas, onTrocarAba }) {
    return (
        <nav className="gerenciamento-abas" aria-label="Seções do gerenciamento">
            {abas.map((aba) => (
                <button
                    key={aba.id}
                    type="button"
                    className={`gerenciamento-abas__item${abaAtiva === aba.id ? ' gerenciamento-abas__item--ativa' : ''}`}
                    aria-current={abaAtiva === aba.id ? 'page' : undefined}
                    onClick={() => onTrocarAba(aba.id)}
                >
                    <IconeAbaGerenciamento id={aba.id} />
                    <span>{aba.rotulo}</span>
                </button>
            ))}
        </nav>
    );
}
