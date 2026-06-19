import { IconeAbaDashboard } from './IconeAbaDashboard.jsx';

/**
 * @param {{
 *   abaAtiva: string,
 *   abas: Array<{ id: string, rotulo: string }>,
 *   onTrocarAba: (id: string) => void
 * }} props
 */
export function AbasDashboard({ abaAtiva, abas, onTrocarAba }) {
    return (
        <nav className="gerenciamento-abas" aria-label="Módulos do dashboard">
            {abas.map((aba) => (
                <button
                    key={aba.id}
                    type="button"
                    className={`gerenciamento-abas__item${abaAtiva === aba.id ? ' gerenciamento-abas__item--ativa' : ''}`}
                    aria-current={abaAtiva === aba.id ? 'page' : undefined}
                    onClick={() => onTrocarAba(aba.id)}
                >
                    <IconeAbaDashboard id={aba.id} />
                    <span>{aba.rotulo}</span>
                </button>
            ))}
        </nav>
    );
}
