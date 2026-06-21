/**
 * @param {{ id: string, className?: string }} props
 */
export function IconeAbaSetores({ id, className = 'gerenciamento-abas__icone' }) {
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
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
        );
    }

    return (
        <svg {...propsSvg}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    );
}
