/**
 * @param {{
 *   abaAtiva: string,
 *   abas: Array<{ id: string, rotulo: string, icone?: import('react').ReactNode }>,
 *   onTrocarAba: (id: string) => void,
 *   rotuloAria?: string
 * }} props
 */
export function AbasModulo({ abaAtiva, abas, onTrocarAba, rotuloAria = 'Seções do módulo' }) {
    return (
        <nav className="gerenciamento-abas" aria-label={rotuloAria}>
            {abas.map((aba) => (
                <button
                    key={aba.id}
                    type="button"
                    className={`gerenciamento-abas__item${abaAtiva === aba.id ? ' gerenciamento-abas__item--ativa' : ''}`}
                    aria-current={abaAtiva === aba.id ? 'page' : undefined}
                    onClick={() => onTrocarAba(aba.id)}
                >
                    {aba.icone || null}
                    <span>{aba.rotulo}</span>
                </button>
            ))}
        </nav>
    );
}
