import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { IconeOlhoAberto, IconeOlhoFechado } from './IconeOlho.jsx';

describe('IconeOlho', () => {
    it('deve renderizar ícones aberto e fechado', () => {
        const { container, rerender } = render(<IconeOlhoAberto className="icone-teste" />);
        expect(container.querySelector('svg.icone-teste')).toBeInTheDocument();

        rerender(<IconeOlhoFechado className="icone-teste" />);
        expect(container.querySelector('svg.icone-teste')).toBeInTheDocument();
    });
});
