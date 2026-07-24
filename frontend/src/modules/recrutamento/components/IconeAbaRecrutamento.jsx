/**
 * @param {{ id: string, className?: string }} props
 */
export function IconeAbaRecrutamento({ id, className = 'gerenciamento-abas__icone' }) {
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

    switch (id) {
        case 'INATIVA':
        case 'rascunho':
            return (
                <svg {...propsSvg}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
            );
        case 'ENCERRADA':
        case 'encerradas':
            return (
                <svg {...propsSvg}>
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
            );
        case 'lixeira':
            return (
                <svg {...propsSvg}>
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
            );
        case 'candidaturas':
            return (
                <svg {...propsSvg}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 11h-6" />
                    <path d="M19 8v6" />
                </svg>
            );
        case 'reativados':
            return (
                <svg {...propsSvg}>
                    <path d="M3 12a9 9 0 0 1 15-6.7" />
                    <path d="M18 3v4h-4" />
                    <path d="M21 12a9 9 0 0 1-15 6.7" />
                    <path d="M6 21v-4h4" />
                </svg>
            );
        case 'processo-aprovacao':
            return (
                <svg {...propsSvg}>
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
            );
        case 'ATIVA':
        case 'ativas':
        default:
            return (
                <svg {...propsSvg}>
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
            );
    }
}
