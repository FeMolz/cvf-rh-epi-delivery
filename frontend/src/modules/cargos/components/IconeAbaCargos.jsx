/**
 * @param {{ id: string, className?: string }} props
 */
export function IconeAbaCargos({ id, className = 'gerenciamento-abas__icone' }) {
    const propsSvg = {
        className,
        width: 16,
        height: 16,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true
    };

    if (id === 'inativos') {
        return (
            <svg {...propsSvg}>
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
        );
    }

    return (
        <svg {...propsSvg}>
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
    );
}
