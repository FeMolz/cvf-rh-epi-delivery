import './logo-sistema.css';

export const URL_LOGO_SISTEMA = '/cvf-logo.png';
export const NOME_SISTEMA = 'CVF Gerenciamento';

/**
 * @param {{ className?: string }} props
 */
export function LogoSistema({ className = '' }) {
    return (
        <img
            src={URL_LOGO_SISTEMA}
            alt="CVF Incorporadora"
            className={['logo-sistema', className].filter(Boolean).join(' ')}
        />
    );
}
