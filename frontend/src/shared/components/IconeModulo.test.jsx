import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { IconeModulo } from './IconeModulo.jsx';

describe('IconeModulo', () => {
    const modulos = [
        'dashboard',
        'noticias',
        'gerenciamento',
        'usuarios-cadastro',
        'roles',
        'employees',
        'companies',
        'setores',
        'epis',
        'epi-deliveries',
        'epi-reports',
        'quesitos',
        'recruitment',
        'ponto',
        'modulo-desconhecido'
    ];

    it.each(modulos)('deve renderizar icone para modulo %s', (id) => {
        const { container } = render(<IconeModulo id={id} />);

        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('deve aceitar className customizada', () => {
        const { container } = render(<IconeModulo id="employees" className="icone-custom" />);

        expect(container.querySelector('svg.icone-custom')).toBeInTheDocument();
    });
});
