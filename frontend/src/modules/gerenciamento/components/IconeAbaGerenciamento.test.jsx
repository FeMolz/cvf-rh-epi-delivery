import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { IconeAbaGerenciamento } from './IconeAbaGerenciamento.jsx';

describe('IconeAbaGerenciamento', () => {
    it.each([
        'plataforma',
        'integracoes',
        'usuarios',
        'cargos',
        'funcionarios',
        'empresas',
        'setores',
        'permissoes',
        'fluxo',
        'unidades',
        'desconhecido'
    ])('deve renderizar svg para aba %s', (id) => {
        const { container } = render(<IconeAbaGerenciamento id={id} />);

        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('deve aceitar className customizada', () => {
        const { container } = render(
            <IconeAbaGerenciamento id="usuarios" className="icone-custom" />
        );

        expect(container.querySelector('svg')).toHaveClass('icone-custom');
    });
});
