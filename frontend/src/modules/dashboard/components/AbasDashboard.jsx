/**
 * @param {{
 *   abaAtiva: string,
 *   abas: Array<{ id: string, rotulo: string }>,
 *   onTrocarAba: (id: string) => void
 * }} props
 */
export function AbasDashboard({ abaAtiva, abas, onTrocarAba }) {
    return (
        <nav className="dashboard-abas" aria-label="Módulos do dashboard">
            {abas.map((aba) => (
                <button
                    key={aba.id}
                    type="button"
                    className={`dashboard-abas__item${abaAtiva === aba.id ? ' dashboard-abas__item--ativa' : ''}`}
                    aria-current={abaAtiva === aba.id ? 'page' : undefined}
                    onClick={() => onTrocarAba(aba.id)}
                >
                    {aba.rotulo}
                </button>
            ))}
        </nav>
    );
}
