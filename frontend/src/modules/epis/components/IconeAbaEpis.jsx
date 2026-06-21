/**
 * @param {{ id: string, className?: string }} props
 */
export function IconeAbaEpis({ id, className = 'gerenciamento-abas__icone' }) {
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

    if (id === 'vinculos') {
        return (
            <svg {...propsSvg}>
                <path d="M12 3 4 7v6c0 5 3.5 8 8 8s8-3 8-8V7l-8-4z" />
                <line x1="12" y1="11" x2="12" y2="15" />
                <line x1="10" y1="13" x2="14" y2="13" />
            </svg>
        );
    }

    return (
        <svg {...propsSvg}>
            <path d="M12 3 4 7v6c0 5 3.5 8 8 8s8-3 8-8V7l-8-4z" />
        </svg>
    );
}
