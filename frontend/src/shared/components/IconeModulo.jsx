/**
 * @param {{ id: string, className?: string }} props
 */
export function IconeModulo({ id, className = 'admin-sidebar__icone' }) {
    const propsSvg = {
        className,
        width: 18,
        height: 18,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true
    };

    switch (id) {
        case 'dashboard':
            return (
                <svg {...propsSvg}>
                    <rect x="3" y="3" width="7" height="9" rx="1" />
                    <rect x="14" y="3" width="7" height="5" rx="1" />
                    <rect x="14" y="12" width="7" height="9" rx="1" />
                    <rect x="3" y="16" width="7" height="5" rx="1" />
                </svg>
            );
        case 'noticias':
            return (
                <svg {...propsSvg}>
                    <path d="M4 19h16" />
                    <path d="M4 4h16v12H4z" />
                    <path d="M8 8h8" />
                    <path d="M8 12h5" />
                </svg>
            );
        case 'gerenciamento':
            return (
                <svg {...propsSvg}>
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
            );
        case 'cadastramento':
            return (
                <svg {...propsSvg}>
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
            );
        case 'departamento-pessoal':
            return (
                <svg {...propsSvg}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            );
        case 'usuarios-cadastro':
            return (
                <svg {...propsSvg}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="16" y1="11" x2="22" y2="11" />
                </svg>
            );
        case 'roles':
            return (
                <svg {...propsSvg}>
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
            );
        case 'employees':
            return (
                <svg {...propsSvg}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            );
        case 'companies':
            return (
                <svg {...propsSvg}>
                    <path d="M3 21h18" />
                    <path d="M6 21V7l6-4 6 4v14" />
                    <path d="M10 11h4" />
                    <path d="M10 15h4" />
                </svg>
            );
        case 'setores':
            return (
                <svg {...propsSvg}>
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                </svg>
            );
        case 'epis':
            return (
                <svg {...propsSvg}>
                    <path d="M12 3 4 7v6c0 5 3.5 8 8 8s8-3 8-8V7l-8-4z" />
                </svg>
            );
        case 'epi-deliveries':
            return (
                <svg {...propsSvg}>
                    <path d="M16 16h6v6H4V4h6" />
                    <path d="m21 3-9 9" />
                    <path d="M15 3h6v6" />
                </svg>
            );
        case 'epi-reports':
            return (
                <svg {...propsSvg}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
            );
        case 'quesitos':
            return (
                <svg {...propsSvg}>
                    <path d="M9 11h6" />
                    <path d="M9 15h6" />
                    <path d="M9 7h6" />
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                </svg>
            );
        case 'recruitment':
            return (
                <svg {...propsSvg}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
            );
        case 'ponto':
            return (
                <svg {...propsSvg}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            );
        default:
            return (
                <svg {...propsSvg}>
                    <circle cx="12" cy="12" r="9" />
                </svg>
            );
    }
}
